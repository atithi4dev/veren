import app from "./app.js";
import dotenv from "dotenv";
import logger from "./logger/logger.js";
import { connectDB, disconnectDB } from "./db/index.js";
import { pollQueue } from "./consumer.js";

dotenv.config({ path: './.env' });

const PORT = Number(process.env.PORT) || 3000;

async function init() {
    await connectDB();

    const server = app.listen(PORT, "0.0.0.0", () => {
        logger.info(`Server is running on port ${PORT}`);
    });

    // Start SQS polling concurrently
    let isPolling = true;
    (async function pollLoop() {
        logger.info("Polling SQS...");
        while (isPolling) {
            try {
                await pollQueue();
            } catch (err) {
                logger.error("Polling error:", err);
                // Prevent tight loop on error
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        logger.info("Stopped SQS polling");
    })();

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
        logger.info(`${signal} received: closing HTTP server`);

        isPolling = false;

        server.close(async () => {
            logger.info("HTTP server closed");
            // Close DB connection
            try {
                // If using a DB module with export, call disconnect here. 
                // We need to import disconnectDB from "./db/index.js".
                // Since I modified db/index.ts, I need to update imports too.
                await (await import("./db/index.js")).disconnectDB();
            } catch (err) {
                logger.error("Error during DB disconnect", err);
            }
            process.exit(0);
        });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
}

init();
