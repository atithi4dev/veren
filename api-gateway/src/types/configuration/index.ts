interface config {
    frontendConfig: FrontendConfig;
    backendConfig: BackendConfig;
    frontendDir: string;
    backendDir: string;
    isConfig: true
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
export default config