import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import fs from "fs/promises";

import logger from "../logger/logger.js";
import { cloneRepo } from "../GitHandler/gitHandler.js";
import repoConfigGenerator, { IBuild } from "../services/repoConfigGenerator.js";
import { DeploymentStatus, publishEvent } from "@veren/domain";
import { CloneJobError } from "../utils/JobError.js";

/* ---------------- TYPES ---------------- */

interface CloneJobData {
  projectId: string;
  deploymentId: string;
  token: string;
  repoUrl: string;
  dirPath: {
    backendDirPath: string;
    frontendDirPath: string;
  };
  build:IBuild;
}

interface CloneJobResult {
  projectId: string;
  deploymentId: string;
  config: unknown;
  commitHash: string;
  commitMessage: string;
}

/* ---------------- REDIS ---------------- */

const connection = new Redis({
  host: process.env.REDIS_HOST || "internal-redis",
  port: 6379,
  maxRetriesPerRequest: null,
});

/* ---------------- WORKER ---------------- */

export const worker = new Worker<CloneJobData, CloneJobResult>(
  "cloneQueue",
  async (job: Job<CloneJobData>) => {
    const {
      projectId,
      deploymentId,
      token,
      repoUrl,
      dirPath,
      build,
    } = job.data;

    let baseDir: string | undefined;

    try {
      /* ---------- VALIDATION ---------- */

      if (!projectId || !deploymentId) {
        throw new CloneJobError("Missing identifiers", {
          msg: "projectId or deploymentId missing",
          metadata: { projectId, deploymentId },
          source: "INTERNAL",
        });
      }

      if (!token || !repoUrl) {
        throw new CloneJobError("Auth failure", {
          msg: "token or repoUrl missing",
          metadata: { projectId, deploymentId },
          source: "INTERNAL",
        });
      }

      if (!dirPath?.backendDirPath || !dirPath?.frontendDirPath) {
        throw new CloneJobError("Invalid directories", {
          msg: "backendDirPath or frontendDirPath missing",
          metadata: { projectId, deploymentId },
          source: "INTERNAL",
        });
      }
      if (!build) {
        throw new CloneJobError("Build config not provided", {
          msg: "Build config not provided",
          metadata: { projectId, deploymentId },
          source: "INTERNAL",
        });
      }

      /* ---------- CLONE ---------- */

      const cloneResult = await cloneRepo(
        repoUrl,
        projectId,
        token,
        dirPath.backendDirPath,
        dirPath.frontendDirPath
      );

      baseDir = cloneResult.baseDir;

      /* ---------- CONFIG ---------- */

      const config = await repoConfigGenerator(
        dirPath,
        build,
        cloneResult.frontendDir,
        cloneResult.backendDir
      );

      if (!config?.isConfig) {
        throw new CloneJobError("Config generation failed", {
          msg: "repoConfigGenerator failed",
          metadata: { projectId, deploymentId },
          source: "INTERNAL",
        });
      }

      /* ---------- SUCCESS ---------- */

      return {
        projectId,
        deploymentId,
        config,
        commitHash: cloneResult.commitHash,
        commitMessage: cloneResult.commitMessage,
      };
    } finally {

    /* ---------- CLEAN FOLDER SPACE ---------- */
    
      if (baseDir) {
        try {
          await fs.rm(baseDir, { recursive: true, force: true });
          logger.info("Cleaned clone workspace", { baseDir });
        } catch (err) {
          logger.warn("Failed to cleanup workspace", { baseDir, err });
        }
      }
    }
  },
  {
    connection,
  }
);

/* ---------------- EVENTS ---------------- */

worker.on("completed", async (job, result) => {
  logger.info("Clone analysis completed", {
    jobId: job.id,
    projectId: result.projectId,
    deploymentId: result.deploymentId,
  });

  publishEvent({
    type: DeploymentStatus.REPO_ANALYSIS_SUCCESS,
    projectId: result.projectId,
    deploymentId: result.deploymentId,
    payload: {
      config: result.config,
      commitHash: result.commitHash,
      commitMessage: result.commitMessage,
    },
  });
});

worker.on("failed", async (job, err) => {
  logger.error("Clone analysis failed", {
    jobId: job?.id,
    err,
  });

  if (err instanceof CloneJobError) {
    publishEvent({
      type: DeploymentStatus.REPO_ANALYSIS_FAILED,
      projectId: job?.data?.projectId!,
      deploymentId: job?.data?.deploymentId!,
      payload: err.payload,
    });
  } else {
    publishEvent({
      type: DeploymentStatus.INTERNAL_ERROR,
      projectId: job?.data?.projectId!,
      deploymentId: job?.data?.deploymentId!,
      payload: {
        msg: "Unexpected worker crash",
      },
    });
  }
});
