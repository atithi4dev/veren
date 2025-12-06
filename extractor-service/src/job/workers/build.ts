import { Worker } from "bullmq";
import { Redis } from "ioredis";
import logger from "../../logger/logger.js";
import axios from "axios";
import { buildFrontend } from "../../services/distributionHandler/BuildDistFolder.js";
import { uploadToS3 } from "../../services/S3/UploadRepositoryToS3.js";
import fs from "fs"

const connection = new Redis({
    maxRetriesPerRequest: null,
    host: process.env.REDIS_HOST || "notification_redis",
    port: 6379,
})

async function safeExecute<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        logger.error("Caught error in safeExecute:", err);
        return fallback;
    }
}

const worker = new Worker('buildQueue',
    async (job) => {
        const { projectId, baseDir, backendDir, frontendDir } = job.data;

        if (!projectId || !baseDir || !backendDir || !frontendDir) {
            logger.error("Some data missing in worker of build");
            return { projectId, baseDir, backendDir, frontendDir, buildSkipped: true };
        }

        // CHECK IF DIRECTORIES EXIST
        if (!fs.existsSync(baseDir) || !fs.existsSync(frontendDir)) {
            logger.error("Directories do not exist for project: ", projectId);
            return { projectId, baseDir, backendDir, frontendDir, buildSkipped: true };
        }

       // Safe execute buildFrontend
        const distFolder = await safeExecute(() => buildFrontend(baseDir), null);

        if (!distFolder) {
            logger.info(`Build was skipped for project ${projectId}`);
            return { projectId, baseDir, backendDir, frontendDir, buildSkipped: true };
        }

        // Upload to S3
        await safeExecute(() => uploadToS3(distFolder, projectId), null);

        return { projectId, baseDir, backendDir, frontendDir, buildSkipped: false }

    }, { connection }
)

worker.on('completed', async (job, result) => {
    try {
        const { projectId, baseDir, backendDir, frontendDir, buildSkipped } = result;

        if (buildSkipped) {
            logger.info(`Build was skipped for project : ${projectId} due to server constraints`);
            return
        }

        if (!projectId || !baseDir || !backendDir || !frontendDir) {
            logger.error("DATA MISSING ON BUILD COMPLETE");
            return;
        }

        await safeExecute(
            () => axios.post(
                "http://backend-service:3000/api/v1/operational",
                {
                    id: projectId,
                    baseDir,
                    backendDir,
                    frontendDir
                },
                { timeout: 10000 }
            ),
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