import { Job, Worker } from "bullmq";
import { Redis } from "ioredis";
import dotenv from "dotenv";

import logger from "../logger/logger.js";
import { buildFrontend } from "../services/distributionHandler/buildFrontend.js";
import { buildBackend } from "../services/distributionHandler/buildBackend.js"
import { safeExecute } from "../types/index.js";

import { DeploymentStatus, publishEvent } from '@veren/domain'
import { BuildJobError } from "../utils/buildError.js";

dotenv.config({ path: "../../.env" });

/* ---------------- TYPES ---------------- */

interface BuildJobData {
    url: string;
    projectId: string;
    deploymentId: string;
    frontendConfig: any;
    backendConfig: any;
}
interface BuildJobResult {
    projectId: string,
    deploymentId: string,
    FrontendtaskArn: string,
    BackendtaskArn: string
}

/* ---------------- REDIS ---------------- */

const connection = new Redis({
    maxRetriesPerRequest: null,
    host: "internal-redis",
    port: 6379,
})

/* ---------------- WORKER ----------------  */

const worker = new Worker<BuildJobData, BuildJobResult>('buildQueue',
    async (job: Job<BuildJobData>) => {
        let { url,
            projectId,
            deploymentId,
            frontendConfig,
            backendConfig,
        } = job.data;
        try {

            if (!projectId || !deploymentId) {
                throw new BuildJobError("Missing identifiers", {
                    msg: "projectId or deploymentId missing",
                    metadata: { projectId, deploymentId },
                    source: "INTERNAL",
                });
            }

            frontendConfig = JSON.parse(JSON.stringify(frontendConfig))
            backendConfig = JSON.parse(JSON.stringify(backendConfig))

            if (!frontendConfig || !backendConfig) {
                throw new BuildJobError("Missing build configs", {
                    msg: "frontendConfig or backendConfig missing",
                    metadata: { projectId, deploymentId },
                    source: "INTERNAL",
                });
            }

            if (!frontendConfig.frontendDir || !backendConfig.backendDir) {
                throw new BuildJobError("Invalid directories", {
                    msg: "frontendDir or backendDir missing",
                    metadata: { projectId, deploymentId },
                    source: "INTERNAL",
                });
            }
            /* ---------- BUILD FRONTEND ---------- */

            const frontendResult = await safeExecute(
                () => buildFrontend(url, projectId, frontendConfig, deploymentId),
                { status: false, taskArn: "" }
            );

            if (!frontendResult.status) {
                throw new BuildJobError("FRONTEND_BUILT_FAILED", {
                    msg: "buildFrontend execution failed",
                    metadata: { projectId, deploymentId },
                    source: "BUILD",
                });
            }

            // Safe execute buildBackend
            /* ---------- BUILD BACKEND ---------- */

            const backendResult = await safeExecute(
                () => buildBackend(url, projectId, backendConfig, deploymentId),
                { status: false, taskArn: "" }
            );

            if (!backendResult.status) {
                throw new BuildJobError("BACKEND_BUILT_FAILED", {
                    msg: "buildBackend execution failed",
                    metadata: { projectId, deploymentId },
                    source: "BUILD",
                });
            }
            /* ---------- SUCCESS ---------- */

            return {
                projectId,
                deploymentId,
                FrontendtaskArn: frontendResult.taskArn,
                BackendtaskArn: backendResult.taskArn,
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

/* ---------------- EVENTS ---------------- */

worker.on('completed', async (job, result) => {
    const { projectId, deploymentId, FrontendtaskArn, BackendtaskArn } = result;

    publishEvent({
        type: DeploymentStatus.BUILD_QUEUE_SUCCESS,
        projectId: result.projectId,
        deploymentId: result.deploymentId,
        payload: {
            frontendTaskArn: result.FrontendtaskArn,
            backendTaskArn: result.BackendtaskArn,
        },
    });
});

worker.on('failed', async (job: any, err: any) => {
    logger.error("Build job failed", {
        jobId: job?.id,
        err,
    });
    if (err instanceof BuildJobError) {
        if (err.message == "BACKEND_BUILT_FAILED") {
            publishEvent({
                type: DeploymentStatus.BACKEND_QUEUE_FAILED,
                projectId: job?.data?.projectId!,
                deploymentId: job?.data?.deploymentId!,
                payload: err.payload,
            });
        } else if (err.message == "FRONTEND_BUILT_FAILED") {
            publishEvent({
                type: DeploymentStatus.FRONTEND_QUEUE_FAILED,
                projectId: job?.data?.projectId!,
                deploymentId: job?.data?.deploymentId!,
                payload: err.payload,
            });
        } else {
            publishEvent({
                type: DeploymentStatus.BUILD_UNKNOWN_FAILURE,
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
