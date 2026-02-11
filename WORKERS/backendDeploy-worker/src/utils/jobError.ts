import { Job } from "bullmq";

export class deploymentJobError extends Error {
    public payload: any;
    constructor (message: string, payload: any){
        super(message);
        this.message = "BackendDeploymentJobError";
        this.payload = payload;
    }
}