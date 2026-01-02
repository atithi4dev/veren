const { exec } = require("child_process")
const path = require("path");
const fs = require("fs")
const redis = require("redis");

const publisher = redis.createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOSTNAME,
        port: process.env.REDIS_PORT,
    }
});

const PROJECT_ID = process.env.PROJECT_ID;
let NODE_VERSION = process.env.NODE_VERSION;
const ECR_URI = process.env.ECR_URI;
const DEPLOYMENT_NUMBER = process.env.DEPLOYMENT_NUMBER;
const BACKEND_DIR = process.env.BACKEND_PATH || "backend";

async function publishLog(log) {
    if (!publisher.isOpen) return;
    await publisher.publish(`backend_builder_logs:${PROJECT_ID}`, JSON.stringify({ message: log }))
}

const shutdown = async (signal) => {
    console.log("Shutting down: ", signal);

    try {
        if (publisher.isOpen) {
            await publisher.quit();
        }
    } finally {
        process.exit(0);
    }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function init() {
    await publisher.connect();

    await publishLog("Backend build started");

    const buildContext = path.join("/home/app/output", BACKEND_DIR);
    if (!fs.existsSync(buildContext)) {
        throw new Error(`Build context path does not exist: ${buildContext}`);
    }
    if (!NODE_VERSION) {
        NODE_VERSION = 18;
    }

    const dockerfilePath = path.join(`/home/app/dockerbackend/Dockerfile_node${NODE_VERSION}`,"Dockerfile");
    const destDockerFile = path.join("/home/app/output", BACKEND_DIR, "Dockerfile");
    fs.copyFileSync(dockerfilePath, destDockerFile);
    
    await publishLog(`Using Dockerfile: ${dockerfilePath}`);
    await publishLog(`Build context: ${buildContext}`);

    // image_Tag = 3w7423428304.dkr.ecr.ap-south-1.amazonaws.com/backend:${DEPLOYMENT_NUMBER}
    const imageTag = `${ECR_URI}:${PROJECT_ID}-${DEPLOYMENT_NUMBER}`
    const kanikoCmd = `/kaniko/executor --context=${buildContext} --dockerfile="Dockerfile" --destination=${imageTag} --verbosity=info`;

    const env = {
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
    }
    const child = exec(kanikoCmd, { env })

    child.stdout.on("data", async (data) => await publishLog(data.toString()));
    child.stderr.on("data", async (data) => await publishLog("ERROR: " + data.toString()));

    child.on("close", async (code) => {
        if (code === 0) {
            await publishLog(`Image build and pushed: ${imageTag}`);
        } else {
            await publishLog(`Image build failed with code: ${code}`);
        }

        await publisher.quit();
        process.exit(code);
    });
}

init();
const MAX_RUNTIME_MS = 10 * 60 * 1000;

setTimeout(() => {
    console.error("Max task runtime exceeded (30 minutes). Forcing exit.");
    process.exit(124);
}, MAX_RUNTIME_MS);