import { frontendConfig18 as config18, frontendConfig20 as config20 } from '../../config/ECSconfig.js'
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs"
import { AwsCredentialIdentity } from "@aws-sdk/types";

import dotenv from "dotenv";
import logger from "../../logger/logger.js";
import { DeploymentStatus, publishEvent } from '@veren/domain';

dotenv.config({
    path: '../../../.env'
});

// Load network config from .env
const SUBNETS = process.env.AWS_SUBNETS?.split(',') || [];
const SECURITY_GROUPS = process.env.AWS_SECURITY_GROUPS?.split(',') || [];

if (SUBNETS.length === 0 || SECURITY_GROUPS.length === 0) {
    throw new Error("Missing subnet or security group configuration in .env");
}

const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!accessKey || !secretKey) throw new Error("Missing AWS credentials");

const credentials: AwsCredentialIdentity = {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
};

const ecsClient = new ECSClient({
    region: "ap-south-1",
    credentials,
});

type BuildReturn = {
    status: boolean,
    taskArn: string
}

export async function buildFrontend(
    url: string,
    projectId: string,
    frontendConfig: any,
    deploymentId: string
): Promise<BuildReturn> {

    let {
        frontendDir, frontendBuildCommand, frontendEnv, buildVersion, frontendInstallCommand, outDir
    } = frontendConfig;

    let taskArn = "";

    const envArray = [
        { name: 'GIT_REPOSITORY__URL', value: url },

        { name: 'PROJECT_ID', value: projectId },
        { name: 'DEPLOYMENTID', value: deploymentId },

        { name: 'FRONTENDPATH', value: frontendDir },
        { name: 'FRONTENDOUTPUTDIR', value: outDir },

        { name: 'BUILDCOMMAND', value: frontendBuildCommand },
        { name: 'INSTALLCOMMAND', value: frontendInstallCommand },

        { name: 'AWS_ACCESS_KEY_ID', value: process.env.AWS_ACCESS_KEY_ID },
        { name: 'AWS_SECRET_ACCESS_KEY', value: process.env.AWS_SECRET_ACCESS_KEY },

        { name: "KAFKA_CLIENT_ID", value: process.env.KAFKA_CLIENT_ID },
        { name: "KAFKA_BROKER1", value: process.env.KAFKA_BROKER1 },
        { name: "KAFKA_SASL_USERNAME", value: process.env.KAFKA_SASL_USERNAME },
        { name: "KAFKA_SASL_PASSWORD", value: process.env.KAFKA_SASL_PASSWORD },
        { name: "DOMAIN_EVENTS_TOPIC_ARN", value: process.env.DOMAIN_EVENTS_TOPIC_ARN }
    ]

    if (Array.isArray(frontendEnv)) {
        frontendEnv.forEach(({ key, value }) => {
            if (key && value !== undefined && value !== null) {
                envArray.push({
                    name: String(key),
                    value: String(value),
                });
            }
        });
    } else if (typeof frontendEnv === "object") {
        Object.entries(frontendEnv).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                envArray.push({
                    name: key,
                    value: String(value),
                });
            }
        });
    }

    //  ECS ECR S3
    if (buildVersion === "18") {
        const command18 = new RunTaskCommand({
            cluster: config18.CLUSTER,
            taskDefinition: config18.TASK,
            launchType: "FARGATE",
            count: 1,
            networkConfiguration: {
                awsvpcConfiguration: {
                    assignPublicIp: 'ENABLED',
                    subnets: SUBNETS,
                    securityGroups: SECURITY_GROUPS,
                }
            },
            overrides: {
                containerOverrides: [
                    {
                        name: config18.CONTAINERNAME,
                        environment: envArray
                    }
                ]
            }
        })

        const resp = await ecsClient.send(command18)
        if (resp.failures && resp.failures.length > 0) {
            publishEvent({
                type: DeploymentStatus.INTERNAL_ERROR,
                projectId,
                deploymentId,
                payload: {
                    commandType: command18,
                    resFailure: resp.failures,
                    msg: "Failed to start ECS task"
                },
            });
            return {
                status: false,
                taskArn: ""
            };
        }

        taskArn = resp.tasks?.[0].taskArn!;
    } else if (buildVersion === "20") {
        const command20 = new RunTaskCommand({
            cluster: config20.CLUSTER,
            taskDefinition: config20.TASK,
            launchType: "FARGATE",
            count: 1,
            networkConfiguration: {
                awsvpcConfiguration: {
                    assignPublicIp: 'ENABLED',
                    subnets: SUBNETS,
                    securityGroups: SECURITY_GROUPS,
                }
            },
            overrides: {
                containerOverrides: [
                    {
                        name: config20.CONTAINERNAME,
                        environment: envArray
                    }
                ]
            }
        })

        const resp = await ecsClient.send(command20)
        if (resp.failures && resp.failures.length > 0) {
            publishEvent({
                type: DeploymentStatus.INTERNAL_ERROR,
                projectId,
                deploymentId,
                payload: {
                    commandType: command20,
                    resFailure: resp.failures,
                    msg: "Failed to start ECS task"
                },
            });
            return {
                status: false,
                taskArn: ""
            };
        }

        taskArn = resp.tasks?.[0].taskArn!;

        logger.info("Task started:", taskArn);
    } else {
        return {
            status: false,
            taskArn: ""
        }
    }

    return {
        status: true,
        taskArn: taskArn!
    };
}