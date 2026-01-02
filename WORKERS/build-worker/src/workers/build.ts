import { Worker } from "bullmq";
import { Redis } from "ioredis";
import logger from "../logger/logger.js";
import { buildFrontend } from "../services/distributionHandler/buildFrontend.js";
import { buildBackend } from "../services/distributionHandler/buildBackend.js"
import dotenv from "dotenv";
import { safeExecute } from "../types/index.js";

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
        const buildFrontendExecuted = await safeExecute(() => buildFrontend(url, projectId, frontendConfig,deploymentId), null);

        // Safe execute buildBackend
        const buildBackendExecuted = await safeExecute(() => buildBackend( url, projectId, backendConfig, deploymentId), null);

        if (!buildFrontendExecuted || !buildBackendExecuted) {
            logger.info(`Build was skipped for project ${projectId}`);
            return { projectId, buildSkipped: true };
        }
        // TEST DEPLOYMENT
        logger.info(`http://${projectId}.localhost:8004/`)
        return { projectId,deploymentId, buildSkipped: false }

    }, { connection }
)

worker.on('completed', async (job, result) => {
    try {
        const { projectId, buildSkipped } = result;

        if (buildSkipped) {
            logger.info(`Build was skipped for project : ${projectId} due to server constraints`);
            return
        }

        if (!projectId) {
            logger.error("Project Id is missing in build result.");
            return;
        }

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




