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

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(cookieParser()); 
app.use(express.static('public'));


app.use(errorHandler)

export default app;