import dotenv from "dotenv";
import { buildResult } from "../types";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { deploymentJobError } from "../utils/jobError";
import {
    DeploymentStatus,
    publishEvent
} from "@veren/domain";

import {
    ECSClient,
    RegisterTaskDefinitionCommand,
    CreateServiceCommand,
    UpdateServiceCommand,
    DescribeServicesCommand,
    ListTasksCommand,
    DescribeTasksCommand
} from "@aws-sdk/client-ecs";

import {
    DescribeNetworkInterfacesCommand,
    EC2Client
} from "@aws-sdk/client-ec2";

dotenv.config({
    path: "../../.env"
});

// NETWORK CONFIG
const SUBNETS =
    process.env.AWS_SUBNETS?.split(",") || [];

const SECURITY_GROUPS =
    process.env.AWS_SECURITY_GROUPS?.split(",") || [];

if (
    SUBNETS.length === 0 ||
    SECURITY_GROUPS.length === 0
) {
    throw new Error(
        "Missing subnet or security group configuration in .env"
    );
}

const accessKey =
    process.env.AWS_ACCESS_KEY_ID!;

const secretKey =
    process.env.AWS_SECRET_ACCESS_KEY!;

if (!accessKey || !secretKey) {
    throw new Error("Missing AWS credentials");
}

const credentials: AwsCredentialIdentity = {
    accessKeyId: accessKey,
    secretAccessKey: secretKey
};

const ecs = new ECSClient({
    region: process.env.AWS_REGION!,
    credentials
});

const ec2 = new EC2Client({
    region: process.env.AWS_REGION!,
    credentials
});

const sleep = (ms: number) =>
    new Promise((resolve) =>
        setTimeout(resolve, ms)
    );

export default async function deploy(
    deploymentId: string,
    projectId: string,
    imageTag: string,
    installCommand: string,
    startCommand: string,
    envs: any
): Promise<buildResult> {
    try {
        const family = `backend-${projectId}`;

        const serviceName =
            `backend-service-${projectId}`;

        const cluster =
            process.env.AWS_BACKEND_CLUSTER!;

        // ENV HANDLING
        const RESERVED_ENV_KEYS = new Set([
            "PORT",
            "NODE_ENV",
            "FRONTEND_URL"
        ]);

        const dynamicenvs: {
            name: string;
            value: string;
        }[] = [];

        (envs || []).forEach((env: any) => {
            const key = String(env.key).trim();
            if (!key) return;

            if (RESERVED_ENV_KEYS.has(key)) {
                console.warn(
                    `Skipping reserved env variable: ${key}`
                );

                return;
            }

            dynamicenvs.push({
                name: key,
                value: String(env.value ?? "")
            });
        });

        // REGISTER TASK DEF
        const registerResponse = await ecs.send(
            new RegisterTaskDefinitionCommand({
                family,
                requiresCompatibilities: [
                    "FARGATE"
                ],
                networkMode: "awsvpc",
                cpu: "256",
                memory: "512",

                executionRoleArn:
                    process.env
                        .AWS_EXECUTION_ROLE_ARN,

                containerDefinitions: [
                    {
                        name: "backend",
                        image: imageTag,
                        essential: true,

                        portMappings: [
                            {
                                containerPort: 80,
                                protocol: "tcp"
                            }
                        ],

                        environment: [
                            {
                                name: "NODE_ENV",
                                value: "production"
                            },
                            {
                                name: "FRONTEND_URL",
                                value: process.env
                                    .FRONTEND_TEST_URL
                            },
                            {
                                name: "PORT",
                                value: "80"
                            },
                            {
                                name: "START_CMD",
                                value: startCommand
                            },
                            ...dynamicenvs
                        ],

                        logConfiguration: {
                            logDriver: "awslogs",

                            options: {
                                "awslogs-group":
                                    "/ecs/backend",

                                "awslogs-region":
                                    process.env
                                        .AWS_REGION!,

                                "awslogs-stream-prefix":
                                    serviceName
                            }
                        }
                    }
                ]
            })
        );

        const taskDefArn =
            registerResponse.taskDefinition
                ?.taskDefinitionArn;

        if (!taskDefArn) {
            throw new Error(
                "Failed to create task definition."
            );
        }

        // CHECK IF SERVICE EXISTS
        const describe =
            await ecs.send(
                new DescribeServicesCommand({
                    cluster,
                    services: [serviceName]
                })
            );

        const serviceExists =
            describe.services &&
            describe.services.length > 0 &&
            describe.services[0].status !==
            "INACTIVE";

        // CREATE OR UPDATE SERVICE
        if (!serviceExists) {
            await ecs.send(
                new CreateServiceCommand({
                    cluster,
                    serviceName,
                    taskDefinition: taskDefArn,
                    desiredCount: 1,
                    launchType: "FARGATE",

                    deploymentConfiguration: {
                        minimumHealthyPercent: 100,
                        maximumPercent: 200
                    },

                    networkConfiguration: {
                        awsvpcConfiguration: {
                            subnets: SUBNETS,

                            securityGroups:
                                SECURITY_GROUPS,

                            assignPublicIp:
                                "ENABLED"
                        }
                    }
                })
            );
        } else {
            await ecs.send(
                new UpdateServiceCommand({
                    cluster,
                    service: serviceName,
                    taskDefinition: taskDefArn,
                    forceNewDeployment: true,

                    deploymentConfiguration: {
                        minimumHealthyPercent: 100,
                        maximumPercent: 200
                    }
                })
            );
        }

        let deploymentTask: any = null;

        let attempts = 0;

        while (
            !deploymentTask &&
            attempts < 40
        ) {
            const list = await ecs.send(
                new ListTasksCommand({
                    cluster,
                    serviceName
                })
            );

            if (!list.taskArns?.length) {
                await sleep(5000);

                attempts++;

                continue;
            }

            const described =
                await ecs.send(
                    new DescribeTasksCommand({
                        cluster,
                        tasks: list.taskArns
                    })
                );

            // CHECK IF TASK STOPPED
            const stoppedTask =
                described.tasks?.find(
                    (task) =>
                        task.taskDefinitionArn ===
                        taskDefArn &&
                        task.lastStatus ===
                        "STOPPED"
                );

            if (stoppedTask) {
                throw new Error(
                    stoppedTask
                        .stoppedReason ||
                    "Deployment task stopped unexpectedly."
                );
            }

            // FIND RUNNING TASK
            const runningTask =
                described.tasks?.find(
                    (task) => {
                        return (
                            task.taskDefinitionArn ===
                            taskDefArn &&
                            task.lastStatus ===
                            "RUNNING"
                        );
                    }
                );

            if (runningTask) {
                deploymentTask =
                    runningTask;

                break;
            }

            await sleep(5000);

            attempts++;
        }

        if (!deploymentTask) {
            throw new Error(
                "Deployment task never became RUNNING."
            );
        }

        // EXTRACT ENI ID
        const eniId =
            deploymentTask.attachments
                ?.flatMap(
                    (a: any) =>
                        a.details || []
                )
                ?.find(
                    (d: any) =>
                        d.name ===
                        "networkInterfaceId"
                )?.value;

        if (!eniId) {
            throw new Error(
                "No ENI found for deployment task."
            );
        }

        // FETCH PUBLIC IP
        const eni = await ec2.send(
            new DescribeNetworkInterfacesCommand(
                {
                    NetworkInterfaceIds: [
                        eniId
                    ]
                }
            )
        );

        const publicIp =
            eni.NetworkInterfaces?.[0]
                ?.Association?.PublicIp;

        return {
            status: true,
            backendDeploymentArn:
                taskDefArn,
            publicIp: publicIp || ""
        };
    } catch (err) {

        publishEvent({
            type: DeploymentStatus.BACKEND_DEPLOY_FAILED,
            projectId,
            deploymentId,
            payload: {
                msg:
                    err instanceof Error
                        ? err.message
                        : "Unexpected deployment error"
            }
        });

        throw new deploymentJobError(
            "Backend Final build operation failed",
            {
                msg:
                    err instanceof Error
                        ? err.message
                        : "Unexpected failure",

                metadata: deploymentId
            }
        );
    }
}