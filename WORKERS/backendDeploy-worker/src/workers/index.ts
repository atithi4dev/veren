import { Job, Worker } from "bullmq"
import { Redis } from "ioredis"
import dotenv from 'dotenv';

// CONFIG
dotenv.config({ path: "../../.env" });


// TYPES
interface BackendDeployJobData {

}

interface BackendDeployResult {

}

// REDIS
const connection = new Redis({
    maxRetriesPerRequest: null,
    host: "internal-redis",
    port: 6379
})

const worker = new Worker<BackendDeployJobData, BackendDeployResult>('backendDeployQueue',
    async (job: Job<BackendDeployJobData>) => {

        // get all data out of Job
        const {} = job.data;
        // verify all data out of Job
        // make a ecs call
        // check if call was success
        // based on check forward a publish event through sqs
        
        return {
            msg:"Doing wait"
        }

}, { connection })


worker.on("completed", async ()=>{

})

worker.on("error", async ()=>{
    
})