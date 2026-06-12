import { ConnectionOptions, Job, Worker } from "bullmq";
import { Redis } from "ioredis";
import dotenv from "dotenv";

import deploy from "../service/deploy";
import { safeExecute } from "../service/safeExecute";
import { deploymentJobError } from "../utils/jobError";

import { DeploymentStatus, publishEvent } from "@veren/domain";
import logger from "../logger/logger";

dotenv.config({ path: "../../../.env" });

interface BackendDeployJobData {
    deploymentId: string;
    projectId: string;
    imageTag: string;
    installCommand: string;
    startCommand: string;
    envs: any;
}

interface BackendDeployJobResult {
    projectId: string;
    deploymentId: string;
    backendDeploymentArn: string;
    publicIp: string;
}

const redis = new Redis({
    host: "internal-redis",
    port: 6379,
    maxRetriesPerRequest: null,
});

const connection: ConnectionOptions =
    redis as unknown as ConnectionOptions;


const worker = new Worker<
    BackendDeployJobData,
    BackendDeployJobResult
>(
    "backendDeployQueue",
    async (job: Job<BackendDeployJobData>) => {
        let {
            deploymentId,
            projectId,
            imageTag,
            installCommand,
            startCommand,
            envs,
        } = job.data;
        try {
            logger.info("DATA RECIVED IN DEPLOYMENT QUEUE");

            if (!projectId || !deploymentId) {
                throw new deploymentJobError("Missing identifiers", {
                    msg: "projectId or deploymentId missing",
                    metadata: { projectId, deploymentId },
                    source: "INTERNAL",
                });
            }

            if (!imageTag) {
                throw new deploymentJobError("Missing imageTag", {
                    msg: "Image URI missing for backend deployment",
                    metadata: { projectId, deploymentId },
                    source: "DATABASE",
                });
            }

            if (!installCommand || !startCommand) {
                throw new deploymentJobError("Missing execution commands", {
                    msg: "installCommand or startCommand missing",
                    metadata: { projectId, deploymentId },
                    source: "DATABASE",
                });
            }


            publishEvent({
                type: DeploymentStatus.BACKEND_DEPLOYING,
                projectId,
                deploymentId,
                payload: {},
            });

            envs = JSON.parse(JSON.stringify(envs));
            const result = await safeExecute(
                () =>
                    deploy(
                        deploymentId,
                        projectId,
                        imageTag,
                        installCommand,
                        startCommand,
                        envs
                    ),
                { status: false, backendDeploymentArn: "", publicIp: "" }
            );

            if (!result.status) {
                throw new deploymentJobError("BACKEND_DEPLOY_FAILED", {
                    msg: "deploy() execution failed",
                    metadata: { projectId, deploymentId },
                    source: "DEPLOY",
                });
            }

            return {
                projectId,
                deploymentId,
                backendDeploymentArn: result.backendDeploymentArn!,
                publicIp: result.publicIp
            };
        } catch (error) {
            logger.error("Backend deploy worker execution failed", {
                jobId: job.id,
                error,
            });
            throw error;
        }
    },
    { connection }
);

worker.on("completed", async (_job, result) => {
    publishEvent({
        type: DeploymentStatus.BACKEND_DEPLOYED,
        projectId: result.projectId,
        deploymentId: result.deploymentId,
        payload: {
            publicIp: result.publicIp,
            backendDeploymentArn: result.backendDeploymentArn,
        },
    });
});

worker.on("failed", async (job: any, err: any) => {
    logger.error("Backend deploy job failed", {
        jobId: job?.id,
        err,
    });

    if (err instanceof deploymentJobError) {
        publishEvent({
            type: DeploymentStatus.BACKEND_DEPLOY_FAILED,
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
                msg: "Unexpected backend deploy worker crash",
            },
        });
    }
});

process.on("uncaughtException", (err) => {
    logger.error("Uncaught exception in backend deploy worker:", err);
});

process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection in backend deploy worker:", reason);
});