import dotenv from "dotenv";
import { buildResult } from "../types";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { deploymentJobError } from "../utils/jobError";
import {
    ECSClient,
    RegisterTaskDefinitionCommand,
    CreateServiceCommand,
    UpdateServiceCommand,
    DescribeServicesCommand
} from "@aws-sdk/client-ecs"

dotenv.config({
    path: "../../.env"
})

// Network config
const SUBNETS = process.env.AWS_SUBNETS?.split(',') || []
const SECURITY_GROUPS = process.env.AWS_SECURITY_GROUPS?.split(',') || []

if (SUBNETS.length === 0 || SECURITY_GROUPS.length === 0) {
    throw new Error("Missing subnet or security group configuration in .env");
}

const accessKey = process.env.AWS_ACCESS_KEY_ID!;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY!;


if (!accessKey || !secretKey) {
    throw new Error("Missing AWS credentials");
}
const credentials: AwsCredentialIdentity = {
    accessKeyId: accessKey,
    secretAccessKey: secretKey
}
const ecs = new ECSClient({
    region: "ap-south-1",
    credentials
})

export default async function deploy(
    deploymentId: string,
    projectId: string,
    imageTag: string,
    installCommand: string,
    startCommand: string,
    dirPath: string,
    envs: any): Promise<buildResult> {
    console.log("--------")
    console.log("--------")
    console.log("--------")
    console.log("--------")
    console.log("--------")
    console.log(envs?.PORT);
    console.log("--------")
    console.log("--------")
    console.log("--------")
    console.log("--------")
    try {
        const family = `backend-${projectId}`;

        const serviceName = `backend-service-${projectId}`;

        const cluster = process.env.AWS_BACKEND_CLUSTER!;

        // Register new task defination (everytime work)

        const registerResponse = await ecs.send(new RegisterTaskDefinitionCommand({
            family,
            requiresCompatibilities: ['FARGATE'],
            networkMode: "awsvpc",
            cpu: "256",
            memory: "512",
            executionRoleArn: process.env.AWS_EXECUTION_ROLE_ARN,
            taskRoleArn: process.env.ECS_TASK_ROLE_ARN,
            containerDefinitions: [
                {
                    name: "backend",
                    image: imageTag,
                    essential: true,
                    portMappings: [{ containerPort: envs?.PORT, protocol: "tcp" }],
                    environment: [
                        { name: "NODE_ENV", value: "production" },
                        ...Object.entries(envs || {}).map(([key, value]) => ({
                            name: key,
                            value: String(value),
                        })),
                    ],
                    logConfiguration: {
                        logDriver: "awslogs",
                        options: {
                            "awslogs-group": "/ecs/backend",
                            "awslogs-region": process.env.AWS_REGION!,
                            "awslogs-stream-prefix": serviceName,
                        }
                    }
                }
            ]
        }))

        const taskDefArn = registerResponse.taskDefinition?.taskDefinitionArn!;

        // Checking ifg service exists
        const describe = await  ecs.send(
            new DescribeServicesCommand({
                cluster,
                services: [serviceName],
            })
        )

        const serviceExists = describe.services && describe.services.length > 0;

        if(!serviceExists){
            // creating a service
        }else{
            // update service
            await ecs.send(
                new UpdateServiceCommand({
                    cluster,
                    service: serviceName,
                    taskDefinition: taskDefArn,
                    forceNewDeployment: true,
                })
            )
        }

        return {
            status: true,
            backendDeploymentArn: taskDefArn
        }

    } catch (err) {

        if (err instanceof deploymentJobError) {
            throw err;
        }

        throw new deploymentJobError("Backend Final build operation failed", {
            msg: "Unexpected failure",
            metadata: deploymentId
        })
    }
}

