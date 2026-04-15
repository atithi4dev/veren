
import path from "path";
import fs from "fs";
import { Kafka } from "kafkajs";
import logger from '../../logger/logger';
import { createClient as createClientRedis } from 'redis';
import ClickHouseClient from "../../db/initClickhouse.js"

// KAFKA CONSUMER SETUP
const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: [process.env.KAFKA_BROKER1!],
    ssl: {
        ca: [
            fs.readFileSync(
                path.join(__dirname, '../../../', 'kafka.pem'),
                'utf-8'
            )
        ]
    },
    sasl: {
        username: process.env.KAFKA_SASL_USERNAME!,
        password: process.env.KAFKA_SASL_PASSWORD!,
        mechanism: 'plain'
    }
})

// Redis Buffer Setup
const bufferRedisStream = createClientRedis({
    socket: { host: "internal-redis", port: 6379 }
});

bufferRedisStream.on("error", (err: any) => {
    // exit service, mail the support team 
    logger.info("Error: ", err);
})

const consumer = kafka.consumer({
    groupId: process.env.KAFKA_CONSUMER_GROUPID!
})

const BATCH_SIZE = 1000;
const FLUSH_INTERVAL_MS = 3000;

let buffer: any[] = [];
let flushTimer: NodeJS.Timeout | null = null;

let flushing = false;

async function flushToClickHouse() {

    if (flushing || buffer.length == 0) return;

    const rows = buffer;

    buffer = [];

    flushing = true

    try {
        await ClickHouseClient.insert({
            table: 'log_events',
            values: rows,
            format: 'JSONEachRow'
        });
    } catch (error) {
        logger.info(`Error while pushing to clickhouse`, error);

        buffer = rows.concat(buffer).slice(0, 10_000);
    } finally {
        flushing = false;
    }
}

async function pushBufferLog(deploymentId: string, projectId: string, log: any) {
    const stream = `logs:deploymentId:${deploymentId}`;
    await bufferRedisStream.xAdd(
        stream,
        "*",
        {
            log,
            projectId,
            deploymentId
        },
        {
            TRIM: {
                strategy: "MAXLEN",
                strategyModifier: "~",
                threshold: 5
            }
        }
    )
}

export default async function initkafkaConsumer() {
    await consumer.connect();
    await bufferRedisStream.connect();

    await consumer.subscribe({ topic: 'backend-builder-logs', fromBeginning: true });
    await consumer.subscribe({ topic: 'frontend-builder-logs', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const raw = message.value?.toString();
            if (!raw) return;

            logger.info(`[${topic}] ${message.offset}: ${raw}`);

            let payload;
            try {
                payload = JSON.parse(raw);
            } catch (error: any) {
                logger.error('Invalid JSON:', raw);
                return;
            }
            logger.info(payload);

            buffer.push({
                deployment_id: payload.deployment_id,
                project_id: payload.project_id,
                topic,
                service: payload.service,
                log: payload.message
            });

            // push to redis streams
            await pushBufferLog(
                payload.deployment_id,
                payload.project_id,
                payload.message
            )

            if (buffer.length >= BATCH_SIZE) {
                flushToClickHouse().catch(err =>
                    logger.error("Async flush failed", err)
                );
            }

            if (!flushTimer) {
                flushTimer = setTimeout(async () => {
                    flushTimer = null;
                    flushToClickHouse().catch(err =>
                        logger.error("Async flush failed", err)
                    );
                }, FLUSH_INTERVAL_MS)
            }

        }
    });

}
