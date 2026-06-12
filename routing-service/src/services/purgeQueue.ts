import { PurgeQueueCommand, SQSClient} from "@aws-sdk/client-sqs"
import logger from "../logger/logger.js";

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
        logger.info("Purging SQS queue...");
        await sqs.send(
            new PurgeQueueCommand({
                QueueUrl: QUEUE_URL
            })
        )

        logger.info("Purge Queue Success");
    } catch (error: any) {
            if (error.name === "PurgeQueueInProgress") {
                logger.info("Purge Already in Progress...")
            }else{
                logger.info("Failed to purge queue", error);
            }
    }
}