import { Queue } from 'bullmq';
import {Redis} from 'ioredis';
const connection = new Redis({
    host:process.env.REDIS_HOST || "notification_redis",
    port: 6379
})

export const buildQueue = new Queue('buildQueue', { connection });
await buildQueue.obliterate({ force: true });
console.log("Queue cleared!");