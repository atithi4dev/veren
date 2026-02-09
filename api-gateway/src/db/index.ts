import mongoose from 'mongoose';
import logger from '../logger/logger.js';

const mongoURI = process.env.MONGO_CONN_STRING ? process.env.MONGO_CONN_STRING : "mongodb://localhost:27017/verenDB";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export const connectDB = async () => {
    await RetryDbCall();
}

async function RetryDbCall() {
    let curRetry = 0;
    while (curRetry < MAX_RETRIES) {
        try {
            await mongoose.connect(mongoURI)
            logger.info("Connected to mongodb");
            return;
        } catch (error) {
            curRetry++;
            logger.error(`Error connecting to mongodb, retrying ... `)
            logger.info(`MongoConnection retry = ${curRetry}/${MAX_RETRIES}`);
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve();
                }, RETRY_DELAY_MS);
            });
        }
    }

    logger.info(`Max retries for mongodb acchived, Exiting with 0`);
    process.exit(1);
}

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        logger.info("Disconnected from mongodb");
    } catch (error) {
        logger.error("Error disconnecting from mongodb", error);
    }
}