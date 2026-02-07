import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { DeploymentStatusI } from './enums';
const sns = new SNSClient({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const TOPIC_ARN = process.env.DOMAIN_EVENTS_TOPIC_ARN!;

export async function publishEvent(event: {
    type: DeploymentStatusI;
    projectId: string;
    deploymentId: string;
    payload: any;
}) {
    await sns.send(
        new PublishCommand({
            TopicArn: TOPIC_ARN,
            Message: JSON.stringify({
                ...event,
                timestamp: new Date().toISOString(),
            }),
            MessageGroupId: event.deploymentId,
            MessageDeduplicationId: `${event.deploymentId}-${Date.now()}`
        })
    )
}