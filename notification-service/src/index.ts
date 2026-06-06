import app from "./app.js";
import initkafkaConsumer from "./services/LogConsumer/kafkaConsumer.js";
import logger from "./logger/logger.js";
import dotenv from "dotenv";

dotenv.config({ path: './.env' });

const PORT = Number(process.env.PORT) || 3000;
async function start() {
//   try {
//     logger.info("Starting Kafka consumer...");
//     // await initkafkaConsumer();
//     logger.info("Kafka consumer started");
//   } catch (err) {
//     logger.error("Kafka consumer failed:", err);
//   }

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}

start();