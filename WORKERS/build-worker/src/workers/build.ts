import { Worker } from "bullmq";
import { Redis } from "ioredis";
import logger from "../logger/logger.js";
import { buildFrontend } from "../services/distributionHandler/buildFrontend.js";
import { buildBackend } from "../services/distributionHandler/buildBackend.js"
import dotenv from "dotenv";
import { safeExecute } from "../types/index.js";
import axios from "axios";

dotenv.config({
    path: '../../.env'
});
const connection = new Redis({
    maxRetriesPerRequest: null,
    host: "internal-redis",
    port: 6379,
})

const worker = new Worker('buildQueue',
    async (job) => {
        let { url,
            projectId,
            deploymentId,
            frontendConfig,
            backendConfig,
        } = job.data;

        if (!projectId) {
            logger.error("Project Id is not found");
            return { buildSkipped: true };
        }

        frontendConfig = JSON.parse(JSON.stringify(frontendConfig))
        backendConfig = JSON.parse(JSON.stringify(backendConfig))

        if (!frontendConfig.frontendDir || !backendConfig.backendDir) {
            logger.error("Directories do not exist for project: ", projectId);
            return { projectId, buildSkipped: true };
        }

        // Safe execute buildFrontend
        const buildFrontendExecuted = await safeExecute(() => buildFrontend(url, projectId, frontendConfig, deploymentId), { status: false, taskArn: "" });

        // Safe execute buildBackend
        const buildBackendExecuted = await safeExecute(() => buildBackend(url, projectId, backendConfig, deploymentId), { status: false, taskArn: "" });

        if (!buildFrontendExecuted.status || !buildBackendExecuted.status) {
            logger.info(`Build was skipped for project ${projectId}`);
            return { projectId, buildSkipped: true };
        }

        const FrontendtaskArn = buildFrontendExecuted.taskArn;
        const BackendtaskArn = buildBackendExecuted.taskArn;
        // TEST DEPLOYMENT
        logger.info(`http://${projectId}.localhost:8004/`)
        return { projectId, deploymentId, FrontendtaskArn, BackendtaskArn, buildSkipped: false }

    }, { connection }
)

worker.on('completed', async (job, result) => {
    try {
        const { projectId, deploymentId, FrontendtaskArn, BackendtaskArn, buildSkipped } = result;

        if (buildSkipped) {
            logger.info(`Build was skipped for project : ${projectId} due to server constraints`);
            return
        }

        if (!projectId) {
            logger.error("Project Id is missing in build result.");
            return;
        }
        if (!deploymentId || !FrontendtaskArn || !BackendtaskArn) {
            logger.error("Deployment failed");
            return;
        }

        await safeExecute(
            () => Promise.resolve(axios.patch(
                `http://api-gateway:3000/api/v1/internal/${projectId}/build-metadata`,
                {
                    projectId, deploymentId, FrontendtaskArn, BackendtaskArn
                },
                { timeout: 10000 })),
            null
        );

        logger.info(`Job ${job.id} completed successfully`);

    } catch (error) {
        logger.error("Error in completed handler:", error);
    }
})

worker.on('failed', async (job: any, err: any) => {
    logger.error(`JOB FAILED WITH ${job.id}`, err);
})

process.on('uncaughtException', (err) => {
    logger.error("Uncaught exception in worker:", err);
});

process.on('unhandledRejection', (reason) => {
    logger.error("Unhandled promise rejection in worker:", reason);
});
