import { simpleGit } from "simple-git";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { folderCheck } from "./PathCheck.js";
import logger from "../logger/logger.js";
import { CloneResult } from "../types/clone.js";
import { CloneJobError } from "../utils/JobError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function cloneRepo(
    repoUrl: string,
    projectId: string,
    token: string,
    backendDirPath: string,
    frontendDirPath: string
): Promise<CloneResult> {

    const baseDir = path.join(__dirname, "../clones", projectId);

    try {
        logger.info("Cloning repository", { repoUrl, projectId });

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
            throw new CloneJobError("Commit metadata missing", {
                msg: "Unable to read commit hash or message",
                metadata: { projectId },
                source: "INTERNAL",
            });
        }

        /* ---------- RESOLVE DIRS ---------- */

        const backendDir = path.join(baseDir, backendDirPath);
        const frontendDir = path.join(baseDir, frontendDirPath);

        /* ---------- VERIFY STRUCTURE ---------- */

        const backendExpected = await folderCheck(authRepoUrl, backendDirPath, "main");
        const frontendExpected = await folderCheck(authRepoUrl, frontendDirPath, "main");

        if (backendExpected && !fs.existsSync(backendDir)) {
            throw new CloneJobError("Backend directory missing", {
                msg: "Backend directory not found after clone",
                metadata: { projectId, backendDirPath },
                source: "INTERNAL",
            });
        }

        if (frontendExpected && !fs.existsSync(frontendDir)) {
            throw new CloneJobError("Frontend directory missing", {
                msg: "Frontend directory not found after clone",
                metadata: { projectId, frontendDirPath },
                source: "INTERNAL",
            });
        }

        /* ---------- SUCCESS ---------- */

        return {
            projectId,
            frontendDir,
            backendDir,
            baseDir,
            commitHash,
            commitMessage,
        };

    } catch (error) {
        logger.error("Clone failed", {
            projectId,
            repoUrl,
            error,
        });

        // Preserve domain errors, wrap unknown ones
        if (error instanceof CloneJobError) {
            throw error;
        }

        throw new CloneJobError("Clone operation failed", {
            msg: "Unexpected git failure",
            metadata: { projectId },
            source: "INTERNAL",
        });
    }
}
