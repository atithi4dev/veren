import { Queue } from 'bullmq';
import {Redis} from 'ioredis';
import logger from "../logger/logger.js";
const connection = new Redis({
    host:process.env.REDIS_HOST || "internal-redis",
    port: 6379
})

export const buildQueue = new Queue('buildQueue', { connection });
// await buildQueue.obliterate({ force: true });
logger.info("Build queue initialized");