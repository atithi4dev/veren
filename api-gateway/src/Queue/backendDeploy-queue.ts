import { Queue } from "bullmq";
import { Redis } from "ioredis";

const connection = new Redis({
    host: process.env.REDIS_HOST || 'internal-redis'
})

export const backendDeployQueue = new Queue('backendDeployQueue', { connection });