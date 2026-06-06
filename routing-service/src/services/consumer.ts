import {
    SQSClient,
    ReceiveMessageCommand,
    DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

import dotenv from 'dotenv';
import { Project } from "@veren/domain";
import { client } from "../app.js";
import logger from "../logger/logger.js";
dotenv.config();

const sqs = new SQSClient({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const QUEUE_URL = process.env.SERVICE_QUEUE_URL!;

export async function pollQueue() {
    const res = await sqs.send(
        new ReceiveMessageCommand({
            QueueUrl: QUEUE_URL,
            MaxNumberOfMessages: 5,
            WaitTimeSeconds: 5,
            VisibilityTimeout: 60,
        })
    );

    if (!res.Messages) return;

    for (const msg of res.Messages) {
        try {
            const event = JSON.parse(msg.Body!);

            await handleEvent(event);

            await sqs.send(
                new DeleteMessageCommand({
                    QueueUrl: QUEUE_URL,
                    ReceiptHandle: msg.ReceiptHandle!,
                })
            );
        } catch (err) {
            logger.error("Processing failed:", err);
        }
    }
}

async function handleEvent(event: any) {
    switch (event.type) {
        case "FRONTEND_BUILD_SUCCESS":
            await frontendDeployed(event);
            break;
        case "BACKEND_DEPLOYED":
            await backendDeployed(event);
            break;
        default:
            // ignore
            break;
    }
}

async function frontendDeployed(event: any) {
    const { projectId } = event;
    const project = await Project.findById(projectId);
    if (project) {
        await client.set(`frontend:${project?.name}`, projectId);
    }
    logger.info("FRONTEND DEPLOYED", projectId);
}

async function backendDeployed(event: any) {
    const { projectId, deploymentId, payload } = event;
    const project = await Project.findById(projectId);
    if (project) {
        await Project.updateOne(
            { _id: projectId },
            {
                $set: {
                    "domains.ip": payload.publicIp
                }
            }
        );
        await client.set(`backend:${project?.name}`, payload.publicIp);
    }
    logger.info("BACKEND DEPLOYED", projectId);
}