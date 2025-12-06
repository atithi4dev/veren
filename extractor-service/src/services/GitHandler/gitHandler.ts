import {simpleGit} from "simple-git";
import path from "path";
import fs from "fs";
import { uploadToS3 } from "../S3/UploadRepositoryToS3.js";
import { fileURLToPath } from "url";
import { folderCheck } from "./PathCheck.js";
import { buildFrontend } from "../distributionHandler/BuildDistFolder.js";
import logger from "../../logger/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function cloneRepo(repoUrl: string, frontend : string, backend: string, id: string, token:string) {
    const projectId = id;
    const baseDir = path.join(__dirname, '../../clones', projectId);
    if(fs.existsSync(baseDir)){
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
        
        // MAKING BACKEND AND FRONTEND DIRECTORIES PATH
        const backendDir = path.join(baseDir, 'backend');
        const frontendDir = path.join(baseDir, 'frontend');

        // Check if backend and frontend folders exist in the repo originally
        const backendCheck = await folderCheck(authRepoUrl, "backend", "main");
        const frontendCheck = await folderCheck(authRepoUrl, "frontend", "main");

        console.log("BACKEND CHECK:", backendCheck);
        console.log("FRONTEND CHECK:", frontendCheck);  
        
        if(!fs.existsSync(backendDir) && backendCheck){
            logger.error("BACKEND WAS NOT CLONED DUE TO GIT ERROR");
        }
        
        if(!fs.existsSync(frontendDir) && frontendCheck){
            logger.error("FRONTEND WAS NOT CLONED DUE TO GIT ERROR");
        }

        return { projectId, baseDir, backendDir, frontendDir, cloneSkipped: false };

    } catch (error) {
        console.error(`Error cloning ${repoUrl} into ${baseDir}:`, error);
        throw error;
    }

}

