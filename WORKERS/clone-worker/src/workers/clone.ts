import { Worker } from "bullmq";
import { Redis } from "ioredis";
import logger from "../logger/logger.js";
import { cloneRepo } from "../GitHandler/gitHandler.js";
import { CloneResult, RepoConfig } from "../types/clone.js";
import { safeExecute } from "../types/index.js";
import axios from "axios";
import repoConfigGenerator from "../services/repoConfigGenerator.js";
import fs from 'fs/promises'

const connection = new Redis({
    maxRetriesPerRequest: null,
    host: process.env.REDIS_HOST || "internal-redis",
    port: 6379,
});
interface dirPath {
    backendDirPath: string,
    frontendDirPath: string
}
const worker = new Worker(
    "cloneQueue",
    async (job) => {
        const {
            projectId,
            deploymentId,
            token,
            repoUrl,
            dirPath,
            build
        } = job.data || {};

/*
        CHECK FOR UPCOMING DATA FROM EXTRACTOR SERVICE 
*/

        let { backendDirPath,
            frontendDirPath } = dirPath as dirPath;

        if (!frontendDirPath || !backendDirPath) {
            return { cloneSkipped: true }
        }

        if (!projectId || !token || !repoUrl || !deploymentId) {
            logger.error("Missing data in cloneQueue", job.data)
            return { projectId, cloneSkipped: true };
        }

/*
        EXECUTE CLONING SERVICE
*/
        const result = await safeExecute<CloneResult>(
            () => cloneRepo(repoUrl,
                projectId,
                token,
                backendDirPath,
                frontendDirPath),
            {
                projectId,
                cloneSkipped: true
            }
        );

        if (result.cloneSkipped) {
            return {
                cloneSkipped: true, projectId,
            }
        }

/*
        EXECUTING CONFIG GENERATOR TO BE PASSED BACK FOR UPDATING DATABASE
*/
        const { frontendDir, backendDir, baseDir, commitHash, commitMessage } = result;
        const config = await safeExecute<RepoConfig>(
            () => repoConfigGenerator(dirPath, build, frontendDir, backendDir),
            { isConfig: false }
        );
        if (config.isConfig) {
            return { config, projectId,deploymentId, baseDir,commitHash, commitMessage, cloneSkipped: false }
        }
    }, { connection }
)

worker.on('completed', async (job, result) => {
    try {
        const {
            projectId,deploymentId, cloneSkipped, config, baseDir, commitHash, commitMessage
        } = result;
        if (cloneSkipped) {
            logger.info(`Cloning was skipped for job ${job.id}, not queuing build.`);
            return
        }

        if (!projectId) {
            logger.error("Project id isNot Found!");
            return;
        }

        if (!config || !commitHash || !commitMessage) {
            logger.error("Config for clone not found.")
            return
        }

        logger.info(`Job ${job.id} completed`);

        // DELETE BASE DIR
        if (baseDir) {
            try {
                await fs.rm(baseDir, { recursive: true, force: true });
                logger.info("Successfully cleared space of clones.")
            } catch (error) {
                logger.error(`Failed to delete baseDir ${baseDir}:`, error);
            }
        } else {
            logger.warn("No baseDir provided to delete.");
        }

        // REQUEST TO API_GATEWAY
        await safeExecute(
            () => axios.patch(
                `http://api-gateway:3000/api/v1/internal/:${projectId}/clone-metadata`,
                {
                    projectId, config, cloneSkipped, deploymentId, commitHash, commitMessage
                },
                { timeout: 10000 }
            ),
            null
        );
    } catch (error) {
        logger.error("Error in completed handler:", error);

    }
})

worker.on('failed', async (job: any, err: any) => {
    logger.error(`JOB FAILED WITH ${job.id}`, err);
})

process.on("uncaughtException", (err) => {
    logger.error("Uncaught exception in clone worker:", err);
});

process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection in clone worker:", reason);
});