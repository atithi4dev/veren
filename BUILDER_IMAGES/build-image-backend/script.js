const { spawn } = require("child_process")
const path = require("path");
const fs = require("fs")
const { Kafka } = require("kafkajs");
const { publishEvent } = require("./publisher");

const PROJECT_ID = process.env.PROJECT_ID;
const ECR_URI = process.env.ECR_URI;
const DEPLOYMENTID = process.env.DEPLOYMENTID;
const BACKEND_DIR = process.env.BACKEND_PATH || "backend";

let NODE_VERSION = process.env.NODE_VERSION;

// KAFKA PRODUCER SETUP
const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: [process.env.KAFKA_BROKER1],
    ssl: {
        ca: [
            fs.readFileSync(
                path.join(process.cwd(), 'kafka.pem'),
                'utf-8'
            )
        ]
    },
    sasl: {
        username: process.env.KAFKA_SASL_USERNAME,
        password: process.env.KAFKA_SASL_PASSWORD,
        mechanism: 'plain'
    }
})

const producer = kafka.producer()

// LOG PUBLISHER
async function publishLog(level, stage, message) {
    const logLine = `[${new Date().toISOString()}] [${level}] [${stage}] ${message}`;

    return producer.send({
        topic: "backend-builder-logs",
        messages: [
            {
                key: "log",
                value: JSON.stringify({
                    PROJECT_ID,
                    DEPLOYMENTID,
                    log: logLine
                })
            }
        ]
    }).catch(err => {
        console.error("Kafka publishlog failed.", err.message);
    })
}

// SHUTDOWN
let exiting = false;
async function safeExit(code, reason) {
    if (exiting) return;
    exiting = true;

    try {
        if (reason) {
            await publishLog("INFO", "SHUTDOWN", reason);
        }
        await producer.disconnect();
    } catch (_) { }
    finally {
        process.exit(code);
    }

}

process.on("SIGINT", () => safeExit(130, "SIGINT"));
process.on("SIGTERM", () => safeExit(143, "SIGTERM"));

// MAIN EXECUTION
async function init() {
    await producer.connect();
    publishLog("INFO", "INIT", "Backend build started");
    console.log("BUILD STARTED");
    const buildContext = path.join("/home/app/output", BACKEND_DIR);
    if (!fs.existsSync(buildContext)) {
        console.log("BUILD CONTEXT DONT EXIST")
        throw new Error(`Build context path does not exist: ${buildContext}`);
    }

    publishEvent("BACKEND_PROCESSING", PROJECT_ID, DEPLOYMENTID, { backendDir: BACKEND_DIR })


    if (!NODE_VERSION) {
        NODE_VERSION = 18;
    }

    const dockerfilePath = path.join(
        `/home/app/dockerbackend/Dockerfile_node${NODE_VERSION}`,
        "Dockerfile"
    );

    const destDockerFile = path.join(
        "/home/app/output", BACKEND_DIR,
        "Dockerfile"
    );

    fs.copyFileSync(dockerfilePath, destDockerFile);
    console.log("FILE COPPIED")
    publishLog("INFO", "CONFIG", `Using Dockerfile: ${dockerfilePath}`);
    publishLog("INFO", "CONFIG", `Build context: ${buildContext}`);

    console.log("READY FOR spawn")

    const imageTag = `${ECR_URI}:${PROJECT_ID}-${DEPLOYMENTID}`


    const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
    const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
    const AWS_REGION = process.env.AWS_REGION

    console.log("Logging all files in build context:", buildContext);
    publishLog("INFO", "FILES", `Listing files in build context: ${buildContext}`);
    logFiles(buildContext);


    const kaniko = spawn("/kaniko/executor", [
        `--context=${buildContext}`,
        `--dockerfile=Dockerfile`,
        `--destination=${imageTag}`,
        `--verbosity=info`
    ], { ...process.env, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION })

    console.log("DONE SPAWN")
    kaniko.stdout.on("data", (data) => {
        publishLog("INFO", "KANIKO", data.toString().trim())
    }
    );

    kaniko.stderr.on("data", (data) => {
        publishLog("DATA", "KANIKO", data.toString().trim())
    }
    );

    console.log("CLOSE");
    kaniko.on("close", async (code) => {
        if (code === 0) {
            await publishLog(
                "SUCCESS",
                "BUILD",
                `Image built and pushed: ${imageTag}`
            );
            
            publishEvent("BACKEND_BUILD_SUCCESS", PROJECT_ID, DEPLOYMENTID, { 
                msg: "Image has built successfully",  
                imageTag: imageTag
            })

            await safeExit(0, "Build success");
        } else {
            await publishLog(
                "FAILURE",
                "BUILD",
                `Image build failed with code: ${code}`
            );
            publishEvent("BACKEND_BUILD_FAILED", PROJECT_ID, DEPLOYMENTID, { msg: "Image build failed with code: ${code}" })
            await safeExit(code, "Build failed");
        }
    });
}

init().catch(err => {
    console.log("INIT ERROR ", err);
    publishLog("FAILURE", "INIT", err.message)
    publishEvent("BACKEND_BUILD_FAILED", PROJECT_ID, DEPLOYMENTID, { msg: err.message })
        .finally(() => safeExit(1, "Build Init Failed"));
});;

// TIMEOUT BRUTE FORCE LOL
const MAX_RUNTIME_MS = 10 * 60 * 1000;

setTimeout(async () => {
    console.log("TIME OVER ");
    publishLog(
        "ERROR",
        "TIMEOUT",
        "Max task runtime exceeded. Forcing exit."
    );
    safeExit(124, "Timeout");
}, MAX_RUNTIME_MS);


function logFiles(dir, prefix = "") {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            console.log(`${prefix}[DIR ] ${item.name}`);
            publishLog("INFO", "FILES", `${prefix}[DIR ] ${fullPath}`);
            logFiles(fullPath, prefix + "  "); // recurse
        } else {
            console.log(`${prefix}[FILE] ${item.name}`);
            publishLog("INFO", "FILES", `${prefix}[FILE] ${fullPath}`);
        }
    }
}
