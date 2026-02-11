import { Job, tryCatch, Worker } from "bullmq"
import { Redis } from "ioredis"
import dotenv from 'dotenv';
import { deploymentJobError } from "../utils/jobError";
import deploy from "../service/deploy";
import { safeExecute } from "../service/safeExecute";

// CONFIG
dotenv.config({ path: "../../.env" });


// TYPES
interface BackendDeployJobData {
    deploymentId: string;
    projectId: string;
    imageTag: string;
    installCommand: string;
    startCommand: string;
    dirPath: string;
    envs: any;
}

interface BackendDeployResult {

}

// REDIS
const connection = new Redis({
    maxRetriesPerRequest: null,
    host: "internal-redis",
    port: 6379
})

/* ---------------- WORKER ----------------  */
const worker = new Worker<BackendDeployJobData, BackendDeployResult>('backendDeployQueue',
    async (job: Job<BackendDeployJobData>) => {

        // get all data out of Job
        let {
            deploymentId,
            projectId,
            imageTag,
            installCommand,
            startCommand,
            dirPath,
            envs } = job.data;
        // verify all data out of Job
        try {
            if (!deploymentId) {
                throw new deploymentJobError("Missing DeploymentId", {
                    msg: "deploymentId missing",
                    metadata: { jobId: job.id },
                    source: "INTERNAL",
                })
            }

            envs = JSON.parse(JSON.stringify(envs));

            if (!envs) {
                throw new deploymentJobError("", {
                    msg: "envs for backend is missing",
                    metadata: { deploymentId },
                    source: "DATABASE"
                })
            }

            if (!installCommand || !startCommand) {
                throw new deploymentJobError("Missing execution commands", {
                    msg: "install and start command are missing during queue for backend build",
                    metadata: { deploymentId },
                    source: "DATABASE"
                })
            }

            if (!dirPath) {
                throw new deploymentJobError("Missing Directory Path to Backend", {
                    msg: "dirPath is missing from queue for backend build",
                    metadata: { deploymentId },
                    source: "DATABASE"
                })
            }
            if (!imageTag) {
                throw new deploymentJobError("Missing imageTag", {
                    msg: "Image URI named imageTag is missing",
                    metadata: { deploymentId },
                    source: "INTERNAL"
                })
            }

            // Safe execute buildBackend
            const backendDeploymentQueued = await safeExecute(() => deploy(
                deploymentId, 
                projectId,
                imageTag,
                installCommand,
                startCommand,
                dirPath,
                envs), { status: false })


        } catch (error) {

        }
        // make a ecs call
        // check if call was success
        // based on check forward a publish event through sqs

        return {
            msg: "Doing wait"
        }

    }, { connection })


worker.on("completed", async () => {

})

worker.on("error", async () => {

})