import { ConnectionOptions, Job, Worker } from "bullmq";
import { Redis } from "ioredis";
import dotenv from "dotenv";

import logger from "../logger/logger.js";
import { buildBackend } from "../services/buildBackend.js";
import { safeExecute } from "../types/index.js";

import { DeploymentStatus, publishEvent } from "@veren/domain";
import { BuildJobError } from "../utils/buildError.js";

dotenv.config({ path: "../../.env" });

interface BackendBuildJobData {
    projectId: string;
    deploymentId: string;
    repoUrl: string;
    backendDirPath: string;
    build: any;
    envs: string;
}

interface BackendBuildJobResult {
    projectId: string;
    deploymentId: string;
    backendTaskArn: string;
}

const redis = new Redis({ host: "internal-redis", port: 6379, maxRetriesPerRequest: null });
const connection: ConnectionOptions = redis as unknown as ConnectionOptions;

const worker = new Worker<BackendBuildJobData, BackendBuildJobResult>(
    "backendBuildQueue",
    async (job: Job<BackendBuildJobData>) => {
        const {
            projectId,
            deploymentId,
            repoUrl,
            backendDirPath,
            build,
        } = job.data;
        
        try {
            if (!projectId || !deploymentId) {
                throw new BuildJobError("Missing identifiers", {
                    msg: "projectId or deploymentId missing",
                    metadata: { projectId, deploymentId },
                    source: "INTERNAL",
                });
            }

            if (!backendDirPath || !build) {
                throw new BuildJobError("Missing backend config", {
                    msg: "backendConfig missing",
                    metadata: { projectId, deploymentId },
                    source: "INTERNAL",
                });
            }

            if (!build.installCommand || !build.runCommand) {
                throw new BuildJobError("Invalid backend config", {
                    msg: "installCommand or runCommand missing",
                    metadata: { projectId, deploymentId },
                    source: "INTERNAL",
                });
            }


            await publishEvent({
                type: DeploymentStatus.BACKEND_BUILD_QUEUED,
                projectId,
                deploymentId,
                payload: {},
            });

            const backendResult = await safeExecute(
                () =>
                    buildBackend(
                        repoUrl,
                        projectId,
                        build,
                        backendDirPath,
                        deploymentId
                    ),
                { status: false, taskArn: "" }
            );

            if (!backendResult.status) {
                throw new BuildJobError("BACKEND_BUILD_FAILED", {
                    msg: "buildBackend execution failed",
                    metadata: { projectId, deploymentId },
                    source: "BUILD",
                });
            }

            return {
                projectId,
                deploymentId,
                backendTaskArn: backendResult.taskArn,
            };
        } catch (error) {
            logger.error("Backend build worker execution failed", {
                jobId: job.id,
                error,
            });
            throw error;
        }
    },
    { connection }
);

worker.on("completed", async (_job, result) => {
    await publishEvent({
        type: DeploymentStatus.BACKEND_BUILDING,
        projectId: result.projectId,
        deploymentId: result.deploymentId,
        payload: {
            backendTaskArn: result.backendTaskArn,
        },
    });
});

worker.on("failed", async (job: any, err: any) => {
    logger.error("Backend build job failed", {
        jobId: job?.id,
        err,
    });

    if (err instanceof BuildJobError) {
        await publishEvent({
            type: DeploymentStatus.BACKEND_BUILD_FAILED,
            projectId: job?.data?.projectId!,
            deploymentId: job?.data?.deploymentId!,
            payload: err.payload,
        });
    } else {
        await publishEvent({
            type: DeploymentStatus.INTERNAL_ERROR,
            projectId: job?.data?.projectId!,
            deploymentId: job?.data?.deploymentId!,
            payload: {
                msg: "Unexpected backend build worker crash",
            },
        });
    }
});

process.on("uncaughtException", (err) => {
    logger.error("Uncaught exception in backend worker:", err);
});

process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection in backend worker:", reason);
});