import {
    SQSClient,
    ReceiveMessageCommand,
    DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

import { repoAnalysisSuccessHandler } from "./controllers/internalService.controller.js";

import dotenv from 'dotenv';
import logger from "./logger/logger.js";
dotenv.config();

const sqs = new SQSClient({
    region: "ap-south-1",
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
            logger.info('Received message from SQS:', { body: msg.Body });

            const event = JSON.parse(msg.Body!);

            await handleEvent(event);

            await sqs.send(
                new DeleteMessageCommand({
                    QueueUrl: QUEUE_URL,
                    ReceiptHandle: msg.ReceiptHandle!,
                })
            );
        } catch (err) {
            logger.error("SQS message processing failed:", { error: err });
        }
    }
}

async function handleEvent(event: any) {
    switch (event.type) {
        case "REPO_ANALYSIS_SUCCESS":
            await onRepoAnalysisSuccess(event);
            break;

        case "REPO_ANALYSIS_FAILED":
            await AnalysisFailed(event);
            break;
        case "BUILD_QUEUE_SUCCESS":
            await buildQueueSuccess(event);
        case "FRONTEND_QUEUE_FAILED":
            await frontendQueueFailed(event);
        case "BACKEND_QUEUE_FAILED":
            await backendQueueFailed(event);
        case "BUILD_UNKNOWN_FAILURE":
            await unknownIssue(event);
        case "FRONTEND_BUILD_SUCCESS":
            await frontendBuildSuccess(event);
        case "BACKEND_BUILD_SUCCESS":
            await backendBuildSuccess(event)
        case "FRONTEND_BUILD_FAILED":
            await frontendBuildFailed(event);
        case "BACKEND_BUILD_FAILED":
            await backendBuildFailed(event);
        default:
            // ignore
            break;
    }
}

/* ---------------- ANALYTICS QUEUE STAGE ---------------- */

async function onRepoAnalysisSuccess(event: any) {
    const { projectId, deploymentId } = event;
    const { commitHash, commitMessage, config } = event.payload
    logger.info("Repo analysis success event received", { projectId, deploymentId, commitHash, commitMessage });
    repoAnalysisSuccessHandler(projectId, config, deploymentId, commitHash, commitMessage)
    logger.debug("Processing repo analysis success event");
}

async function AnalysisFailed(event: any) {
    // update stage of deployment to failed + frontend udpate with issue
    logger.info("Repo analysis failed event received");
}

/* ---------------- PRE BUILD QUEUE STAGE ---------------- */

async function buildQueueSuccess(event: any) {
    // update deploying to please stay tuned , build may take a while depending upon network 
    // provide arn to notification service, to start passing logs to frontend through WS    
}

async function frontendQueueFailed(event: any) {
    // Notify user about INTERNAL SERVER ERROR , Please wait while we resolve the issue
    // Notify @supoort for the same
}

async function backendQueueFailed(event: any) {
    // Notify user about INTERNAL SERVER ERROR , Please wait while we resolve the issue
    // Notify @supoort for the same
}

async function unknownIssue(event: any) {
    // Inform user
}

/* ---------------- ECS POST BUILD STAGE ---------------- */

async function frontendBuildSuccess(event: any) {
    // Inform orchestrate service
}
async function backendBuildSuccess(event: any) {
    // Inform orchestrate service
}
async function frontendBuildFailed(event: any) {
    // Inform User , Provide Error, 
    // IF (backendSuccess){
    // fallback to previous state, stop backend mid way if incomplete, else remove the image from ecr    
    // }
}
async function backendBuildFailed(event: any) {
    // Inform user, Provide Error
    // IF (frontendSuccess){
    // fallback S3 object to previous state, remove pushed item, update db for s3 url
    // }
}