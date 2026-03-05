import app from "./app.js";
import dotenv from "dotenv";
import logger from "./logger/logger.js";
import { connectDB } from "./db/index.js";
import { startQueueWorker } from "./services/consumer.js";
import { purgeQueueOnStartup } from "./services/purgeQueue.js";

dotenv.config({ path: './.env' });

const PORT = Number(process.env.PORT) || 3000;

async function init() {
    await connectDB();

    await purgeQueueOnStartup();
    
    app.listen(PORT, "0.0.0.0", () => {
        logger.info(`Server is running on port ${PORT}`);
    });

    // Start BullMQ worker for backendDeployQueue
    startQueueWorker();
}

init();
