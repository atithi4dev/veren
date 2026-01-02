import { simpleGit } from "simple-git";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { folderCheck } from "./PathCheck.js";
import logger from "../logger/logger.js";
import { CloneResult } from "../types/clone.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function cloneRepo(repoUrl: string, projectId: string, token: string, backendDirPath: string, frontendDirPath: string): Promise<CloneResult> {
    const baseDir = path.join(__dirname, '../clones', projectId);
    if (fs.existsSync(baseDir)) {
        logger.info("Directory already exists. Skipping clone for project:", projectId);
    }

    try {
        logger.info("Cloning", repoUrl, "into", baseDir);

        fs.mkdirSync(baseDir, { recursive: true });

        const authRepoUrl = repoUrl.replace(
            "https://github.com/",
            `https://${token}@github.com/`
        );

        const git = simpleGit();
        await git.clone(authRepoUrl, baseDir, ["--depth=1"]);

        const repoGit = simpleGit(baseDir);

        const log = await repoGit.log({ maxCount: 1 });

        const commitHash = log.latest?.hash;
        const commitMessage = log.latest?.message;

        if (!commitHash || !commitMessage) {
            throw new Error("Failed to read commit metadata");
        }

        // MAKING BACKEND AND FRONTEND DIRECTORIES PATH
        const backendDir = path.join(baseDir, backendDirPath);
        const frontendDir = path.join(baseDir, frontendDirPath);

        // Check if backend and frontend folders exist in the repo originally
        const backendCheck = await folderCheck(authRepoUrl, "backend", "main");
        const frontendCheck = await folderCheck(authRepoUrl, "frontend", "main");

        logger.info("BACKEND CHECK:", backendCheck);
        logger.info("FRONTEND CHECK:", frontendCheck);

        if (!fs.existsSync(backendDir) && backendCheck) {
            logger.error("BACKEND WAS NOT CLONED DUE TO GIT ERROR");
            return { projectId, cloneSkipped: true };
        }

        if (!fs.existsSync(frontendDir) && frontendCheck) {
            logger.error("FRONTEND WAS NOT CLONED DUE TO GIT ERROR");
            return { projectId, cloneSkipped: true };
        }
        return { projectId, cloneSkipped: false, frontendDir, backendDir, baseDir, commitHash, commitMessage };

    } catch (error) {
        logger.error(`Error cloning ${repoUrl} into ${baseDir}:`, error);
        throw error;
    }

}

