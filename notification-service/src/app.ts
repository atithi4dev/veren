import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morganMiddleware from "./logger/indexLog.js";
import { errorHandler } from "./middlewares/error.middlewares.js";

const app = express();

app.use(morganMiddleware()); 

app.use(
     cors({
          origin: process.env.CORS_ORIGIN,
          credentials: true,
     })
);

// Middleware to parse JSON and URL-encoded data along with static files
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(cookieParser()); 
app.use(express.static('public'));


// BUILD_QUEUE_SUCCESS Handle 

// FRONTEND_BUILD_SUCCESS Handle 

app.use(errorHandler)

export default app;
