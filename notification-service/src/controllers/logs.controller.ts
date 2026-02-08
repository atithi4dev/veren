import { createClient } from '@clickhouse/client'
import path from "path";
import fs from "fs";
import { Kafka } from "kafkajs";

const client = createClient({
    host: process.env.CLICKHOUSE_HOST,
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

// KAFKA PRODUCER SETUP
const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: [process.env.KAFKA_BROKER1!],
    ssl: {
        ca: [
            fs.readFileSync(
                path.join(__dirname, '../../', 'kafka.pem'),
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

const consumer = kafka.consumer({ groupId: 'notification-service-logs-consumer' })

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
        await client.insert({
            table: 'log_events',
            values: rows,
            format: 'JSONEachRow'
        });
    } catch (error) {
        console.log(`Error while pushing to clickhouse`, error);

        buffer = rows.concat(buffer).slice(0,10_000);
    } finally {
        flushing = false;
    }
}


export default async function initkafkaConsumer() {
    await consumer.connect();

    await consumer.subscribe({ topic: 'backend-builder-logs', fromBeginning: false });
    await consumer.subscribe({ topic: 'frontend-builder-logs', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const raw = message.value?.toString();
            if (!raw) return;

            console.log(`[${topic}] ${message.offset}: ${raw}`);

            let payload;
            try {
                payload = JSON.parse(raw);
            } catch (error) {
                console.error('Invalid JSON:', raw);
                return;
            }

            buffer.push({
                event_id: payload.event_id,
                deployment_id: payload.deployment_id,
                project_id: payload.project_id,
                topic,
                service: payload.service,
                log: payload.log
            });

            if (buffer.length >= BATCH_SIZE) {
                flushToClickHouse().catch(err =>
                    console.error("Async flush failed", err)
                );
            }

            if (!flushTimer) {
                flushTimer = setTimeout(async () => {
                    flushTimer = null;
                    flushToClickHouse().catch(err =>
                        console.error("Async flush failed", err)
                    );
                }, FLUSH_INTERVAL_MS)
            }

        }
    });

}

