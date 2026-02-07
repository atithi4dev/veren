import app from "./app.js";
import dotenv from "dotenv";
import logger from "./logger/logger.js";
import { connectDB, disconnectDB } from "./db/index.js";
import { pollQueue } from "./consumer.js";

dotenv.config({ path: './.env' });

const PORT = Number(process.env.PORT) || 3000;

async function init() {
    let server: any; // Type should be Server but using any for simplicity if types aren't handy
    let isPolling = true;

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
        logger.info(`${signal} received: closing HTTP server`);

        isPolling = false;

        if (server) {
            server.close(async () => {
                logger.info("HTTP server closed");
                // Close DB connection
                try {
                    await (await import("./db/index.js")).disconnectDB();
                } catch (err) {
                    logger.error("Error during DB disconnect", err);
                }
                process.exit(0);
            });
        } else {
            logger.info("HTTP server not started yet, exiting...");
            // Close DB connection directly if server wasn't running
            try {
                await (await import("./db/index.js")).disconnectDB();
            } catch (err) {
                logger.error("Error during DB disconnect", err);
            }
            process.exit(0);
        }
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    try {
        await connectDB();
    } catch (err) {
        logger.error("Failed to connect to DB during init", err);
        // Retry logic in DB module should handle this, but if it throws, we exit.
    }

    server = app.listen(PORT, "0.0.0.0", () => {
        logger.info(`Server is running on port ${PORT}`);
    });

    // Start SQS polling concurrently
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
}


init();
