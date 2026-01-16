import app from "./app.js";
import initkafkaConsumer from "./controllers/logs.controller.js";
import logger from "./logger/logger.js";
import dotenv from "dotenv"

dotenv.config({
    path: './.env'
});

const PORT = Number(process.env.PORT) || 3000;
initkafkaConsumer();

app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server is running on port ${PORT}`);
});
