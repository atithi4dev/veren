import { ConnectionOptions, Job, Worker } from "bullmq";
import { Redis } from "ioredis";
import dotenv from "dotenv";

import logger from "../logger/logger.js";
import { buildFrontend } from "../services/distributionHandler/buildFrontend.js";
import { safeExecute } from "../types/index.js";

import { DeploymentStatus, publishEvent } from '@veren/domain'
import { BuildJobError } from "../utils/buildError.js";

dotenv.config({ path: "../../.env" });

/* ---------------- TYPES ---------------- */

interface FrontendBuildJobData {
    projectId: string,
    deploymentId: string,
    token: string,
    repoUrl: string,
    frontendDirPath: string,
    build: any,
    envs: any
}
interface FrontendBuildJobResult {
    projectId: string,
    deploymentId: string,
    FrontendtaskArn: string,
}

const redis = new Redis({ host: "internal-redis", port: 6379, maxRetriesPerRequest: null });
const connection: ConnectionOptions = redis as unknown as ConnectionOptions;

const worker = new Worker<FrontendBuildJobData, FrontendBuildJobResult>('frontendBuildQueue',
    async (job: Job<FrontendBuildJobData>) => {
        let { 
            projectId,
            deploymentId,
            token,
            repoUrl,
            frontendDirPath,
            build,
            envs
        } = job.data;
        try {
            if (!projectId || !deploymentId) {
                throw new BuildJobError("Missing identifiers", {
                    msg: "projectId or deploymentId missing",
                    metadata: { projectId, deploymentId },
                    source: "INTERNAL",
                });
            }

            const {installCommand, buildCommand, outDir, version} = build;

            if (!installCommand || !buildCommand || !outDir) {
                throw new BuildJobError("Missing build configs", {
                    msg: "frontendConfig is missing",
                    metadata: { projectId, deploymentId },
                    source: "INTERNAL",
                });
            }

            if (!frontendDirPath) {
                throw new BuildJobError("Invalid directory", {
                    msg: "frontendDir is missing",
                    metadata: { projectId, deploymentId },
                    source: "INTERNAL",
                });
            }

            const frontendResult = await safeExecute(
                () => buildFrontend(repoUrl, projectId, frontendDirPath, token, installCommand, buildCommand, outDir, deploymentId, envs, version),
                { status: false, taskArn: "" }
            );

            if (!frontendResult.status) {
                throw new BuildJobError("FRONTEND_BUILT_FAILED", {
                    msg: "buildFrontend execution failed",
                    metadata: { projectId, deploymentId },
                    source: "BUILD",
                });
            }


            return {
                projectId,
                deploymentId,
                FrontendtaskArn: frontendResult.taskArn
            };
        } catch (error) {
            logger.error("Build worker execution failed", {
                jobId: job.id,
                error
            })
            throw error;
        }
    }

    , { connection }
)

worker.on('completed', async (job, result) => {
    publishEvent({
        type: DeploymentStatus.FRONTEND_BUILD_QUEUED,
        projectId: result.projectId,
        deploymentId: result.deploymentId,
        payload: {
            frontendTaskArn: result.FrontendtaskArn
        },
    });
});

worker.on('failed', async (job: any, err: any) => {
    logger.error("Build job failed", {
        jobId: job?.id,
        err,
    });
    if (err instanceof BuildJobError) {
       if (err.message == "FRONTEND_BUILT_FAILED") {
            publishEvent({
                type: DeploymentStatus.FRONTEND_BUILD_FAILED,
                projectId: job?.data?.projectId!,
                deploymentId: job?.data?.deploymentId!,
                payload: err.payload,
            });
        } else {
            publishEvent({
                type: DeploymentStatus.INTERNAL_ERROR,
                projectId: job?.data?.projectId!,
                deploymentId: job?.data?.deploymentId!,
                payload: err.payload,
            });
        }
    } else {
        publishEvent({
            type: DeploymentStatus.INTERNAL_ERROR,
            projectId: job?.data?.projectId!,
            deploymentId: job?.data?.deploymentId!,
            payload: {
                msg: "Unexpected build worker crash",
            },
        });
    }
})

process.on('uncaughtException', (err) => {
    logger.error("Uncaught exception in worker:", err);
});

process.on('unhandledRejection', (reason) => {
    logger.error("Unhandled promise rejection in worker:", reason);
});
