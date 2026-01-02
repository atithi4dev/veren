type CloneSuccess = {
    projectId: string;
    cloneSkipped: false;
    frontendDir: string;
    backendDir: string;
    baseDir: string,
    commitHash:string; 
    commitMessage: string;
}

type CloneSkipped = {
    projectId: string;
    cloneSkipped: true;
}


type FrontendConfig = {
    frontendDir: string;
    frontendBuildCommand: string;
    frontendInstallCommand: string;
    buildVersion: string;
    buildType: string;
    outDir: string;
}


type BackendConfig = {
    backendDir: string,
    buildVersion: string,
    backendInstallCommand: string
};

type generatedConfig = {
    frontendConfig: FrontendConfig;
    backendConfig: BackendConfig;
    frontendDir: string;
    backendDir: string;
    isConfig: true
}
type noConfig = {
    isConfig: false
}

type RepoConfig = generatedConfig | noConfig
type CloneResult = CloneSuccess | CloneSkipped;

export { CloneSkipped, CloneSuccess, CloneResult, RepoConfig, generatedConfig };