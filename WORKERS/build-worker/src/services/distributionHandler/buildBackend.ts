import logger from "../../logger/logger.js";
import dotenv from 'dotenv';
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import { backendECSConfig } from "../../config/ECSconfig.js"
import { DeploymentStatus, publishEvent } from "@veren/domain";

dotenv.config({
    path: '../../../.env'
});

// Network config in .env
const SUBNETS = process.env.AWS_SUBNETS?.split(',') || [];
const SECURITY_GROUPS = process.env.AWS_SECURITY_GROUPS?.split(',') || [];
if (SUBNETS.length === 0 || SECURITY_GROUPS.length === 0) {
    throw new Error("Missing subnet or security group configuration in .env");
}

const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!accessKey || !secretKey) {
    throw new Error("Missing AWS credentials");
}

const credentials: AwsCredentialIdentity = {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
}

const ecsClient = new ECSClient({
    region: "ap-south-1",
    credentials
})

type BuildReturn = {
    status: boolean,
    taskArn: string
}

export async function buildBackend(
    url: string,
    projectId: string,
    backendConfig: any,
    deploymentId: string
): Promise<BuildReturn> {

    let { backendDir, buildVersion } = backendConfig;

    const envArray = [
        { name: "GIT_REPOSITORY__URL", value: url },
        { name: "NODE_VERSION", value: buildVersion },
        { name: "PROJECT_ID", value: projectId },
        { name: "DEPLOYMENTID", value: deploymentId },
        { name: "BACKEND_PATH", value: backendDir },

        { name: "ECR_URI", value: process.env.ECR_URI },
        { name: "AWS_ACCESS_KEY_ID", value: process.env.AWS_ACCESS_KEY_ID },
        { name: "AWS_SECRET_ACCESS_KEY", value: process.env.AWS_SECRET_ACCESS_KEY },
        { name: "AWS_REGION", value: process.env.AWS_REGION },

        { name: "KAFKA_CLIENT_ID", value: process.env.KAFKA_CLIENT_ID },
        { name: "KAFKA_BROKER1", value: process.env.KAFKA_BROKER1 },
        { name: "KAFKA_SASL_USERNAME", value: process.env.KAFKA_SASL_USERNAME },
        { name: "KAFKA_SASL_PASSWORD", value: process.env.KAFKA_SASL_PASSWORD },
        { name: "DOMAIN_EVENTS_TOPIC_ARN", value: process.env.DOMAIN_EVENTS_TOPIC_ARN }
    ]

    const backendCommand = new RunTaskCommand({
        cluster: backendECSConfig.CLUSTER,
        taskDefinition: backendECSConfig.TASK,
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
                    name: backendECSConfig.CONTAINERNAME,
                    environment: envArray
                }
            ]
        }
    })

    const resp = await ecsClient.send(backendCommand)
    if (resp.failures && resp.failures.length > 0) {
        publishEvent({
            type: DeploymentStatus.INTERNAL_ERROR,
            projectId,
            deploymentId,
            payload: {
                commandType: backendCommand,
                resFailure: resp.failures,
                msg: "Failed to start ECS task"
            },
        });
        return {
            status: false,
            taskArn: ''
        };
    }

    const taskArn = resp.tasks?.[0].taskArn;
    logger.info("Task started:", taskArn);

    return {
        status: true,
        taskArn: taskArn!
    };
}
