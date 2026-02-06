const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const sns = new SNSClient({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const TOPIC_ARN = process.env.DOMAIN_EVENTS_TOPIC_ARN;

async function publilishEvent(type, projectId, deploymentId, payload) {
    await sns.send(
        new PublishCommand({
            TopicArn: TOPIC_ARN,
            Message: JSON.stringify({
                type, projectId, deploymentId, payload,
                timestamp: new Date().toISOString(),
            }),
            MessageGroupId: deploymentId,
            MessageDeduplicationId: `${deploymentId}-${Date.now()}`
        })
    )
}

module.exports = { publilishEvent };