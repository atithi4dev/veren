import app from "./app.js";
import dotenv from "dotenv";
import logger from "./logger/logger.js";
import { connectDB } from "./db/index.js";
import { pollQueue } from "./consumer.js";

dotenv.config({ path: './.env' });

const PORT = Number(process.env.PORT) || 3000;

async function init() {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
        logger.info(`Server is running on port ${PORT}`);
    });

    // Start SQS polling concurrently
    (async function pollLoop() {
        logger.info("Starting SQS polling...");
        while (true) {
            try {
                await pollQueue();
            } catch (err) {
                logger.error("SQS polling error:", { error: err });
            }
        }
    })();
}

init();
