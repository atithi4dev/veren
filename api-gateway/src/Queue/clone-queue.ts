import { Queue } from 'bullmq';
import {Redis} from 'ioredis';
import logger from "../logger/logger.js";
const connection = new Redis({
    host:process.env.REDIS_HOST || "internal-redis",
    port: 6379
})

export const cloneQueue = new Queue('cloneQueue', { connection });
await cloneQueue.obliterate({ force: true });
logger.info("Clone queue initialized");