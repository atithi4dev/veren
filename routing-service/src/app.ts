import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morganMiddleware from "./logger/indexLog.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
import httpProxy from "http-proxy";
import healthCheckRouter from './routes/healthCheck.route.js'
import logger from "./logger/logger.js";
import { createClient } from "redis"
const app = express();
import { Project } from "@veren/domain";

app.use(morganMiddleware());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

// Middleware to parse JSON and URL-encoded data along with static files
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(cookieParser());
app.use(express.static('public'));

app.use('/health', healthCheckRouter)
const proxy = httpProxy.createProxyServer();
const BASEPATH = process.env.S3_BASEPATH;


const client = createClient({
    socket: { host: "internal-redis", port: 6379 }
})

client.on("error", (err) => {
    logger.error(err);
});

app.use(async (req, res) => {

    const hostname = req.hostname;
    const parts = hostname.split(".");

    let isApiRequest = false;
    let projectName = "";

    if (parts[0] === "api") {
        isApiRequest = true;
        projectName = parts[1];
    } else {
        projectName = parts[0];
    }
    if (isApiRequest) {
        let backendIp = await client.get(`backend:${projectName}`);
        if (!backendIp || backendIp === "") {
            const project = await Project.findOne({
                name: projectName
            })
            if (!project || !project.domains.ip) {
                return res.send("404 not found");
            }
            backendIp = project.domains.ip;
            if (!backendIp) {
                return res.send("404 not found");
            }

            await client.set(`backend:${projectName}`, backendIp);
        }
        return proxy.web(req, res, {
            target: `http://${backendIp}`,
            changeOrigin: true
        })
    }

    let projectId = await client.get(`frontend:${projectName}`);

    if (!projectId || projectId === "") {
        const project = await Project.findOne({
            name: projectName
        })
        if (!project) {
            return res.send("404 not found");
        }
        projectId = project._id.toString();
        await client.set(`frontend:${projectName}`, projectId);
    } 
    let path = req.url;
    if(path === "/" || path === ""){
        path = "/index.html";
    }
    const target = `${BASEPATH}/${projectId}${path}`;

    return proxy.web(req,res, {
        target,
        changeOrigin: true,
        ignorePath: true
    })
   
});

app.use(errorHandler)

export { app, client };