import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morganMiddleware from "./logger/indexLog.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
import httpProxy from "http-proxy";
import healthCheckRouter from  './routes/healthCheck.route.js'
import { subscriber } from "./socket.js";
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

app.use('/health', healthCheckRouter)
const proxy = httpProxy.createProxyServer();
const BASEPATH = `https://veren-v2.s3.ap-south-1.amazonaws.com/__outputs/`

// Routes Forwarding

app.use((req,res)=>{
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];
    const resolvesTo = `${BASEPATH}${subdomain}`
    console.log(subdomain)

    proxy.web(req,res,{target: resolvesTo,changeOrigin: true})
})

proxy.on('proxyReq', (proxyReq, req, res)=>{
    const url = req.url;
    if(url === '/'){
        proxyReq.path += 'index.html';
    }
})

// TESTING REDIS SUBSCRIPTION FROM BUILDER ECS
const helper = async ()=>{
    await subscriber.connect();
    subscriber.on('error',()=>{
        console.log(`Error connecting to Redis`);
    })
    
    // backend deployment check
    subscriber.pSubscribe('backend_builder_logs:*', (message, channel)=>{
        console.log("CHANNEL : ", channel)
        console.log("MESSAGE : ", message)
    })
    // frontend deployment check
    subscriber.pSubscribe('logs:*', (message, channel)=>{
        console.log("CHANNEL : ", channel)
        console.log("MESSAGE : ", message)
    })
}
helper();

app.use(errorHandler)

export default app;