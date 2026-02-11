import {
    SQSClient,
    ReceiveMessageCommand,
    DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

import { repoAnalysisSuccessHandler } from "./controllers/internalService.controller.js";

import dotenv from 'dotenv';
import { Deployment, Project, publishEvent } from "@veren/domain";
import { backendDeployQueue } from "./Queue/backendDeploy-queue.js";
import ecrImageExistsCheck from "./utils/ecrCheck/ecrImageExistsCheck.js";
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
            const event = JSON.parse(msg.Body!);

            await handleEvent(event);

            await sqs.send(
                new DeleteMessageCommand({
                    QueueUrl: QUEUE_URL,
                    ReceiptHandle: msg.ReceiptHandle!,
                })
            );
        } catch (err) {
            console.error("Processing failed:", err);
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
            break;
        case "FRONTEND_QUEUE_FAILED":
            await frontendQueueFailed(event);
            break;
        case "BACKEND_QUEUE_FAILED":
            await backendQueueFailed(event);
            break;
        case "BUILD_UNKNOWN_FAILURE":
            await unknownIssue(event);
            break;
        case "FRONTEND_BUILD_SUCCESS":
            await frontendBuildSuccess(event);
            break;
        case "BACKEND_BUILD_SUCCESS":
            await backendBuildSuccess(event)
            break;
        case "FRONTEND_BUILD_FAILED":
            await frontendBuildFailed(event);
            break;
        case "BACKEND_BUILD_FAILED":
            await backendBuildFailed(event);
            break;
        default:
            // ignore
            break;
    }
}

/* ---------------- ANALYTICS QUEUE STAGE ---------------- */

async function onRepoAnalysisSuccess(event: any) {
    const { projectId, deploymentId } = event;
    const { commitHash, commitMessage, config } = event.payload;

    await repoAnalysisSuccessHandler(projectId, config, deploymentId, commitHash, commitMessage);
}

async function AnalysisFailed(event: any) {
    const { deploymentId, payload } = event;
    await Deployment.findByIdAndUpdate(deploymentId, {
        status: "failed",
        finishedAt: new Date(),
        error: {
            type: event.type,
            message: payload?.source === "INTERNAL" ? `INTERNAL SERVER ERROR : ${payload.msg}` : payload?.msg,
        }
    })

}

/* ---------------- PRE BUILD QUEUE STAGE ---------------- */

async function buildQueueSuccess(event: any) {
    const { projectId, deploymentId } = event;
    const { frontendTaskArn, backendTaskArn } = event.payload;
    await Deployment.findByIdAndUpdate(deploymentId, {
        status: "building",
        frontendTaskArn,
        backendTaskArn,
    });

}

async function frontendQueueFailed(event: any) {
    // Notify @supoort for the same

    const { deploymentId, payload } = event;
    await Deployment.findByIdAndUpdate(deploymentId, {
        status: "failed",
        finishedAt: new Date(),
        error: {
            type: event.type,
            message: `INTERNAL SERVER ERROR : ${payload.msg}`,
        }
    })
}

async function backendQueueFailed(event: any) {
    // Notify @supoort for the same

    const { deploymentId, payload } = event;
    await Deployment.findByIdAndUpdate(deploymentId, {
        status: "failed",
        finishedAt: new Date(),
        error: {
            type: event.type,
            message: `INTERNAL SERVER ERROR : ${payload.msg}`,
        }
    })
}

async function unknownIssue(event: any) {
    // Notify @supoort for the same

    const { deploymentId, payload } = event;
    await Deployment.findByIdAndUpdate(deploymentId, {
        status: "failed",
        finishedAt: new Date(),
        error: {
            type: event.type,
            message: `UNCATCHED ISSUE : ${payload.msg}`,
        }
    })
}

/* ---------------- ECS POST BUILD STAGE ---------------- */

async function frontendBuildSuccess(event: any) {
    const { projectId, deploymentId, artifactUrl } = event;

    const deployment = await Deployment.findById(deploymentId)
    if (deployment?.rollBackArtifactUrl != "" || deployment?.rollBackArtifactUrl?.length != 0) {
        const oldArtifact = deployment?.artifactUrl;
        await Deployment.findByIdAndUpdate(deploymentId, {
            artifactUrl,
            rollBackArtifactUrl: oldArtifact
        })
    } else {
        await Deployment.findByIdAndUpdate(deploymentId, {
            artifactUrl,
        })
    }
}

async function backendBuildSuccess(event: any) {
    const { deploymentId, projectId } = event;
    const { imageTag } = event.payload;

    const exist = await ecrImageExistsCheck(imageTag);
    if (exist) {
        const project = await Project.findById(projectId);

        await backendDeployQueue.add("backendDeployQueue", {
            deploymentId, 
            projectId,
            imageTag, 
            installCommand: project?.build?.backendInstallCommand,
            startCommand: project?.build?.backendStartCommand,
            dirPath: project?.repoPath?.backendDirPath,
            envs: project?.envs?.backendEnv
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
        // queue delete of current frontend deployment if exist
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
    // queue delete of current backend deployment if exist
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
    // queue delete of current backend deployment if exist
    // fallback S3 object to previous state, remove pushed item, update db for s3 url
}