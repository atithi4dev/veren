import { generatedConfig, RepoConfig } from '../types/clone.js'
import {
    detectProjectType,
    detectNodeVersion,
    detectBuildCommand,
    detectInstallCommand
} from "./detector/detectProjectType.js";

interface DirPath {
    frontendDirPath: string;
    backendDirPath: string;
}
export interface IBuild {
    framework?: string;
    frontendBuildCommand?: string;
    backendBuildCommand?: string;
    frontendInstallCommand?: string;
    backendInstallCommand?: string;
    frontendOutDir: string;
}

const repoConfigGenerator = async (
    dirPath: DirPath,
    build: IBuild,
    frontendDir: string,
    backendDir: string
): Promise<RepoConfig> => {

    const { frontendDirPath, backendDirPath } = dirPath;
    let { frontendBuildCommand, frontendInstallCommand, backendInstallCommand, frontendOutDir } = build;

    const frontendBuildVersion = detectNodeVersion(frontendDirPath);
    const backendBuildVersion = detectNodeVersion(backendDirPath);
    const buildType = detectProjectType(frontendDirPath)

    if (!frontendBuildCommand) {
        frontendBuildCommand = detectBuildCommand(frontendDirPath, buildType);
    }
    if (!frontendInstallCommand) {
        frontendInstallCommand = detectInstallCommand(frontendDirPath, buildType);
    }

    if (!backendInstallCommand) {
        backendInstallCommand = "npm install"
    }

    let frontendConfig = {
        frontendDir: frontendDirPath,
        buildVersion: frontendBuildVersion,
        buildType,
        frontendBuildCommand,
        frontendInstallCommand,
        outDir: frontendOutDir
    }


    const backendConfig = {
        backendDir: backendDirPath,
        backendInstallCommand,
        buildVersion: backendBuildVersion
    };

    return {
        frontendConfig, backendConfig, frontendDir: frontendDirPath,
        backendDir: backendDirPath, isConfig: true
    }
}

export default repoConfigGenerator;