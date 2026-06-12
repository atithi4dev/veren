import app from "./app.js";
import logger from "./logger/logger.js";
import dotenv from "dotenv"
import { purgeQueueOnStartup } from "./services/purgeQueue.js";
// import { pollQueue } from "./services/consumer.js";

dotenv.config({
    path: './.env'
});

const PORT = Number(process.env.PORT) || 3000;

async function init() {

    await purgeQueueOnStartup();

    app.listen(PORT, "0.0.0.0", () => {
        logger.info(`Server is running on port ${PORT}`);
    });

    // (async function pollLoop() {
    //     logger.info("Polling SQS...");
    //     while (true) {
    //         try {
    //             await pollQueue();
    //         } catch (err) {
    //             console.error("Polling error:", err);
    //         }
    //     }
    // })();
}

init();