import app from "./app.js";
import dotenv from "dotenv";
import logger from "./logger/logger.js";
// import connectDB from "./db/index.js";

dotenv.config({
     path: './.env'
});
const PORT = Number(process.env.PORT);

app.listen(PORT,"0.0.0.0", () => {
          logger.info(`Server is running on port ${PORT}`);
});