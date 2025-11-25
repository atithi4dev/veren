import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const asyncExec = promisify(exec);

export async function buildFrontend(baseDir: string) {
    const frontendPath = path.join(baseDir, "frontend");

    // Check if frontend directory exists
    try {
        await fs.access(frontendPath);
    } catch {
        console.log("No frontend folder found, skipping build.");
        return null;
    }

    console.log("Frontend folder found. Starting build...");

    // Run npm install
    try {
        console.log("Installing dependencies...");
        await asyncExec("npm install", { cwd: frontendPath });
    } catch (err) {
        console.error("Failed npm install:", err);
        throw new Error("Frontend npm install failed");
    }

    // Run npm run build
    try {
        console.log("Running build...");
        await asyncExec("npm run build", { cwd: frontendPath });
    } catch (err) {
        console.error("Failed npm build:", err);
        throw new Error("Frontend build failed");
    }

    const distPath = path.join(frontendPath, "dist");

    console.log("Build success. Dist located at:", distPath);
    return distPath;
}
