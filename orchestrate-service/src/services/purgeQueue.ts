import {PurgeQueue$, PurgeQueueCommand, SQSClient} from "@aws-sdk/client-sqs"

const sqs = new SQSClient({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const QUEUE_URL = process.env.SERVICE_QUEUE_URL!;

export async function  purgeQueueOnStartup() {
    try {
        console.log("Purging SQS queue...");
        await sqs.send(
            new PurgeQueueCommand({
                QueueUrl: QUEUE_URL
            })
        )

        console.log("Purge Queue Success");
    } catch (error: any) {
            if (error.name === "PurgeQueueInProgress") {
                console.log("Purge Already in Progress...")
            }else{
                console.log("Failed to purge queue", error);
            }
    }
}