import {
    SQSClient,
    ReceiveMessageCommand,
    DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

import dotenv from 'dotenv';
import { Deployment, DeploymentStatus, Project, publishEvent } from "@veren/domain";

import { backendDeployQueue } from "../Queue/backendDeploy-queue.js";

import ecrImageExistsCheck from "../utils/ecrCheck/ecrImageExistsCheck.js";
import logger from "../logger/logger.js";

dotenv.config();


/* ----------- SQS CONFIG ----------- */

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
            const outer = JSON.parse(msg.Body!)
            const event = outer.Message ? JSON.parse(outer.Message) : outer

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
        case "INTERNAL_ERROR":
            await internalErrorHandler(event);
            break;
        case "CREATED":
            await created(event);
            break;
        case "FRONTEND_BUILD_QUEUED":
            await frontendBuildQueued(event);
            break;
        case "FRONTEND_BUILD_FAILED":
            await frontendBuildFailed(event);
            break;
        case "FRONTEND_BUILD_SUCCESS":
            await frontendBuildSuccess(event);
            break;
        case "BACKEND_BUILD_QUEUED":
            await backendBuildQueued(event);
            break;
        case "BACKEND_BUILDING":
            await backendBuilding(event);
            break;
        case "BACKEND_BUILD_FAILED":
            await backendBuildFailed(event);
            break;
        case "BACKEND_BUILD_SUCCESS":
            await backendBuildSuccess(event);
            break;
        case "BACKEND_DEPLOY_FAILED":
            await backendDeployFailed(event);
            break;
        case "BACKEND_DEPLOYED":
            await backendDeployed(event);
            break;
        default:
            // ignore
            break;
    }
}

async function internalErrorHandler(event: any) {
    // send a support mail , responsibility of mail queue
}
async function created(event: any) {
    logger.info("Deployment Created")
}

async function frontendBuildQueued(event: any) {
    const { deploymentId, payload } = event;

    const { frontendTaskArn } = payload;

    await Deployment.findByIdAndUpdate(deploymentId, {
        status: "building",
        frontendTaskArn
    })
}

async function frontendBuildFailed(event: any) {
    const { deploymentId, payload } = event;

    await Deployment.findByIdAndUpdate(deploymentId, {
        status: "failed",
        finishedAt: new Date(),
        error: {
            type: event.type,
            message: payload.msg,
        }
    })
}

async function frontendBuildSuccess(event: any) {
    const { projectId, deploymentId } = event;
    try {
        await Deployment.findByIdAndUpdate(deploymentId, {
            status: "deployed",
            finishedAt: new Date(),
        });
    } catch (error) {
        throw new Error(`Frontend Build success. Event handler error. Project ID:${projectId} DeploymentId: ${deploymentId}`);
    }
}


async function backendBuildQueued(event: any) {
    const { deploymentId } = event;

    await Deployment.findByIdAndUpdate(deploymentId, {
        status: "building"
    })
}

async function backendBuildSuccess(event: any) {
    const { deploymentId, projectId } = event;
    const { imageTag } = event.payload;
    logger.info("BACKEND SUCCESS");
    let exist;
    for (let i = 0; i < 5; i++) {
        exist = await ecrImageExistsCheck(imageTag);

        if (exist) break;

        await new Promise(r => setTimeout(r, 3000));
    }
    if (exist) {
        const project = await Project.findById(projectId);

        await publishEvent({
            type: DeploymentStatus.BACKEND_DEPLOY_QUEUED,
            projectId: projectId,
            deploymentId: deploymentId,
            payload: {
                msg: "Deployment has been queued to worker."
            },
        });

        await backendDeployQueue.add("backendDeployQueue", {
            deploymentId,
            projectId,
            imageTag,
            installCommand: project?.backendBuild?.installCommand,
            startCommand: project?.backendBuild?.runCommand,
            envs: project?.envs
        }, {
            attempts: 1,
            backoff: {
                type: "exponential",
                delay: 1000
            },
            removeOnComplete: true,
            removeOnFail: true
        })

        await Deployment.findByIdAndUpdate(deploymentId, {
            backendImageUrl: imageTag,
        })
    } else {
        // @support
        await Deployment.findByIdAndUpdate(deploymentId, {
            status: "failed",
            finishedAt: new Date(),
            error: {
                type: event.type,
                message: `INTERNAL SERVER ERROR`,
            }
        })
    }

}

async function backendBuildFailed(event: any) {
    const { deploymentId, payload } = event;

    await Deployment.findByIdAndUpdate(deploymentId, {
        status: "failed",
        finishedAt: new Date(),
        error: {
            type: event.type,
            message: payload.msg,
        }
    })
}

async function backendBuilding(event: any) {
    const { deploymentId } = event;

    await Deployment.findByIdAndUpdate(deploymentId, {
        status: "building",
    })
}

async function backendDeployFailed(event: any) {
    const { deploymentId } = event;
    // delete ecr image  + requeue
    await Deployment.findByIdAndUpdate(deploymentId, {
        status: "failed",
    })
}

async function backendDeployed(event: any) {
    const { projectId, deploymentId, payload } = event;
    const {
        publicIp,
        backendDeploymentArn
    } = payload;

    await Deployment.findByIdAndUpdate(deploymentId, {
        status: "deployed",
    })
}