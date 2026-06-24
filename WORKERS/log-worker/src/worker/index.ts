import dotenv from "dotenv"
import fs from "fs";
import path from "path";
import { createClient } from "@clickhouse/client"
import { Kafka } from "kafkajs"
import { createClient as createRedisClient } from "redis"
import { fileURLToPath } from "url";
dotenv.config();

// clickhouse config
const ClickHouseClient = createClient({
    host: process.env.CLICKHOUSE_HOST!,
    database: "default",
    username: process.env.CLICKHOUSE_USERNAME,
    password: process.env.CLICKHOUSE_PASSWORD,
    request_timeout: 120_000,

    clickhouse_settings: {
        async_insert: 1,
        wait_for_async_insert: 0,
        max_execution_time: 120
    }
})

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// kafka config
const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: [process.env.KAFKA_BROKER1!],
    ssl: {
        ca: [
            fs.readFileSync(
                path.join(__dirname, "../../../../", 'kafka.pem'),
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

// redis buffer setup
const bufferRedisStream = createRedisClient({
    socket: { host: "internal-redis", port: 6379 }
});

bufferRedisStream.on("error", (err: unknown) => {
    console.log("Error: ", err);
});

const consumer = kafka.consumer({
    groupId: process.env.KAFKA_GROUP_ID!
})

const pushBufferLog = async (deploymentId: string, projectId: string, log: string) => {
    const stream = `logs:deploymentId:${deploymentId}`;

    /*
    Append deployment log
    into Redis stream : stream
    with auto-generated ID : "*"
    and keep stream size small : "~(approximate) 5"
    */

    bufferRedisStream.xAdd(
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

const BATCH_SIZE = 1000;
const FLUSH_INTERVAL_MS = 3000;

let buffer: any[] = [];
let flushTimer: NodeJS.Timeout | null = null;
let flushing = false;

async function flushToClickHouse() {
    if (flushing || buffer.length == 0) return;

    const rows = buffer;
    buffer = [];

    flushing = true;

    try {
        await ClickHouseClient.insert({
            table: "log_events",
            values: rows,
            format: 'JSONEachRow'
        });
    } catch (error) {
        console.error("Error while pushing to clickhouse", error);
        buffer = rows.concat(buffer).slice(0, 10_000);
    } finally {
        flushing = false;
    }
}

const initkafkaConsumer = async () => {

    console.log("Starting Logs consumer worker...");

    await consumer.connect();
    await bufferRedisStream.connect();

    await consumer.subscribe({ topic: 'frontend-builder-logs', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const raw = message.value?.toString();
            if (!raw) return;

            console.log(`[${topic}] ${message.offset}`);

            let payload;

            try {
                payload = JSON.parse(raw);
            } catch (error: unknown) {
                console.error("INVALID JSON: ", raw);
                return;
            }
            console.log(payload);

            buffer.push({
                deployment_id: payload.deployment_id,
                project_id: payload.project_id,
                topic,
                level: payload.level,
                stage: payload.stage,
                service: topic === "frontend-builder-logs"? "frontend": "backend",
                log: payload.message,
                ts: payload.ts
            })

            // push to redis streams
            await pushBufferLog(
                payload.deployment_id,
                payload.project_id,
                payload.message
            )

            if (buffer.length >= BATCH_SIZE) {
                flushToClickHouse().catch(err => console.error("Async flush failed", err));
            }

            if (!flushTimer) {
                flushTimer = setTimeout(async () => {
                    flushTimer = null;
                    flushToClickHouse().catch(err => console.error("Async flush failed", err));
                }, FLUSH_INTERVAL_MS)
            }
        }
    })
}

initkafkaConsumer().catch(err => {
    console.error("Kafka consumer startup failed:", err);
    process.exit(1);
});;