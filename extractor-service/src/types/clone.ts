type CloneSuccess = {
    projectId: string;
    baseDir: string;
    backendDir: string;
    frontendDir: string;
    cloneSkipped?: false;
}

type CloneSkipped = {
    cloneSkipped: true;
}

type CloneResult = CloneSuccess | CloneSkipped;

export { CloneSkipped, CloneSuccess, CloneResult };