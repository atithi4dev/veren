import { app, client } from "./app.js";
import dotenv from "dotenv";
import logger from "./logger/logger.js";
import { pollQueue } from "./services/consumer.js";
// import connectDB from "./db/index.js";
import {connectDB} from './db/index.js'
dotenv.config({
    path: './.env'
});

const PORT = Number(process.env.PORT!);

async function init() {
    await connectDB();
    await client.connect();

    app.listen(PORT, "0.0.0.0", () => {
        logger.info(`Server is running on port ${PORT}`);
    });
    // Start SQS polling concurrently
    (async function pollLoop() {
        logger.info("Polling SQS...");
        while (true) {
            try {
                await pollQueue();
            } catch (err) {
                console.error("Polling error:", err);
            }
        }
    })();
}

init();