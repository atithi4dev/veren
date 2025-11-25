import {simpleGit} from "simple-git";
import path from "path";
import fs from "fs";
import { uploadToS3 } from "../S3/UploadRepositoryToS3.js";
import { fileURLToPath } from "url";
import { folderCheck } from "./PathCheck.js";
import { buildFrontend } from "../distributionHandler/BuildDistFolder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function cloneRepo(repoUrl: string, frontend : string, backend: string, id: string, token:string) {
    const projectId = id;
    const baseDir = path.join(__dirname, '../../clones', projectId);
    
    try {
        console.log("Cloning", repoUrl, "into", baseDir);

        fs.mkdirSync(baseDir, { recursive: true });
        
        const authRepoUrl = repoUrl.replace(
            "https://github.com/",
            `https://${token}@github.com/`
        );

        const git = simpleGit();
        await git.clone(authRepoUrl, baseDir, ["--depth=1"]);
        
        // MAKING BACKEND AND FRONTEND DIRECTORIES
        const backendDir = path.join(baseDir, 'backend');
        const frontendDir = path.join(baseDir, 'frontend');

        // Check if backend and frontend folders exist in the repo originally
        const backendCheck = await folderCheck(authRepoUrl, "backend", "main");
        const frontendCheck = await folderCheck(authRepoUrl, "frontend", "main");

        console.log("BACKEND CHECK:", backendCheck);
        console.log("FRONTEND CHECK:", frontendCheck);  
        
        if(!fs.existsSync(backendDir) && backendCheck){
            fs.mkdirSync(backendDir, { recursive: true });
            console.log("Created backend directories");
        }else{
            console.log("Backend folder already exists skipping creation");
        }
        
        if(!fs.existsSync(frontendDir) && frontendCheck){
            fs.mkdirSync(frontendDir, { recursive: true });
            console.log("Created frontend directories");
        }else{
            console.log("Frontend folder already exists skipping creation");
        }

        // DOING BUILD OPERATION FOR FRONTEND AND ONLY SERVING THE DIST FOLDER

       const distFolder = await buildFrontend(baseDir);
       await uploadToS3(distFolder ?? baseDir, projectId);
        
        return { projectId, baseDir, backendDir, frontendDir };

    } catch (error) {
        console.error(`Error cloning ${repoUrl} into ${baseDir}:`, error);
        throw error;
    }

}

