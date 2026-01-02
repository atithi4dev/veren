import path from "path";
import fs from "fs";

// Types
interface PackageJSON {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    engines?: { node?: string };
    scripts?: Record<string, string>;
}

// Normalize version strings like "v18" → "18"
function normalizeVersion(v: string): string {
    return v.replace(/^v/, "").trim();
}

// Resolve version ranges ">=18" or "^18.0.0"
function resolveEngineRange(range: string): string {
    const match = range.match(/\d+/);
    return match ? match[0] : "20";
}

// Read JSON file 
export function readJSON(filePath: string): PackageJSON {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
        return {};
    }
}

export function detectProjectType(projectDir: string): "nextjs" | "react" | "vue" | "vite" | "static" {
    const pkg = readJSON(path.join(projectDir, "package.json"));

    const deps = {
        ...pkg.dependencies,
        ...pkg.devDependencies
    };

    if (deps.next) return "nextjs";
    if (deps.vue || deps["vue-router"]) return "vue";
    if (deps.react && deps["react-scripts"]) return "react";
    if (deps.vite) return "vite";

    return "static";
}

// Detect Node.js version from .nvmrc, .node-version, or package.json engines
export function detectNodeVersion(projectDir: string): string {
    const nvmrcPath = path.join(projectDir, ".nvmrc");
    const nodeVersionFile = path.join(projectDir, ".node-version");
    const pkgPath = path.join(projectDir, "package.json");

    if (fs.existsSync(nvmrcPath)) {
        const v = fs.readFileSync(nvmrcPath, "utf-8").trim();
        if (v) return normalizeVersion(v);
    }

    if (fs.existsSync(nodeVersionFile)) {
        const v = fs.readFileSync(nodeVersionFile, "utf-8").trim();
        if (v) return normalizeVersion(v);
    }

    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = readJSON(pkgPath);
            if (pkg.engines?.node) {
                return resolveEngineRange(pkg.engines.node);
            }
        } catch (err) {
            console.warn("Error parsing package.json:", err);
        }
    }

    return "18";
}

// Detect build command for the detected framework
export function detectBuildCommand(filePath: string, framework: string): string {
    
    const pkgPath = path.join(filePath, "package.json");

    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = readJSON(pkgPath);
            if (pkg.scripts?.build) return pkg.scripts.build;
        } catch (error) {
            return "echo 'No build script defined'"            
        }
    }
    
    switch (framework) {
        case "nextjs":
            return "npx next build";
        case "vue":
            return "npx vue-cli-service build";
        case "react":
            return "npx react-scripts build";
        case "vite":
            return "npx vite build";
        default:
            return "echo 'No build script defined'";
    }
}

function detectPackageManager(projectDir: string): "pnpm" | "yarn" | "npm" {
    if (fs.existsSync(path.join(projectDir, "pnpm-lock.yaml"))) return "pnpm";
    if (fs.existsSync(path.join(projectDir, "yarn.lock"))) return "yarn";
    if (fs.existsSync(path.join(projectDir, "package-lock.json"))) return "npm";
    return "npm";
}

export function detectInstallCommand(
    projectDir: string,
    framework: string
): string {

    const pm = detectPackageManager(projectDir);

    const baseInstall = (() => {
        switch (pm) {
            case "pnpm":
                return "pnpm install --frozen-lockfile";
            case "yarn":
                return "yarn install --frozen-lockfile";
            case "npm":
            default:
                return "npm install";
        }
    })();

    switch (framework) {
        case "nextjs":
        case "react":
        case "vue":
        case "vite":
            return baseInstall;

        default:
            return baseInstall;
    }
}

// Detect output directory based on the framework
export function detectOutputDir(framework: string): string {
    switch (framework) {
        case "nextjs":
            return ".next";
        case "vue":
        case "vite":
        case "react":
            return "build";
        default:
            return "dist";
    }
}
