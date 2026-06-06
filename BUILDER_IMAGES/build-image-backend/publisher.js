const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const sns = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const TOPIC_ARN = process.env.DOMAIN_EVENTS_TOPIC_ARN;

async function publishEvent(type, projectId, deploymentId, payload) {
  console.log(TOPIC_ARN);
  try {
    await sns.send(
      new PublishCommand({
        TopicArn: TOPIC_ARN,
        Message: JSON.stringify({
          type,
          projectId,
          deploymentId,
          payload,
          timestamp: new Date().toISOString(),
        }),
        MessageGroupId: deploymentId,
        MessageDeduplicationId: `${deploymentId}-${Date.now()}`,
      })
    );
    console.log("PUBLISHED:", type); 
  } catch (error) {
    console.error("error: ", error);
  }
}

module.exports = { publishEvent };