import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morganMiddleware from "./logger/indexLog.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
import session from "express-session";
import MongoStore from "connect-mongo";

const app = express();

app.use(morganMiddleware());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(
    session({
        secret: process.env.SESSION_SECRET || "default_secret",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_CONN_STRING ? process.env.MONGO_CONN_STRING : "mongodb://localhost:27017/verenDB",
            ttl: 30 * 24 * 60 * 60,
            autoRemove: 'native'
        }),
        cookie: {
            secure: false,
            httpOnly: true,
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        }
    })
)

// Middleware to parse JSON and URL-encoded data along with static files
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(cookieParser());
app.use(express.static('public'));


// Routes Imports
import healthCheckRouter from "./routes/healthCheck.route.js";
import urlRouter from "./routes/url.route.js";
import AuthHandler from "./routes/auth.route.js";   
import RepoHandler from "./routes/repo.route.js";

// ROUTING SERVCIE SPECIAL IMPORTS AND FORWARDING
import RouteHandler from "./routes/router.route.js";

// Routes Forwarding
app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/url", urlRouter)
app.use("/api/v1/auth", AuthHandler)
app.use("/api/v1/repo", RepoHandler)
app.use("/api/v1/route", RouteHandler)

app.use(errorHandler)

export default app;