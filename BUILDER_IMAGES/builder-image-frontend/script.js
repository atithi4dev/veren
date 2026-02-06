const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");
const readDirRecursive = require("./utils/readDirRecursive");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Kafka } = require("kafkajs");
const { publilishEvent } = require("./publisher");

/* ---------------- ENV ---------------- */

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION = "ap-south-1",
  PROJECT_ID,
  DEPLOYMENTID,
  FRONTENDPATH,
  BUILDCOMMAND = "npm run build",
  INSTALLCOMMAND = "npm install",
  KAFKA_CLIENT_ID,
  KAFKA_BROKER1,
  KAFKA_SASL_USERNAME,
  KAFKA_SASL_PASSWORD,
  KAFKA_CA_PATH = "/home/app/kafka.pem",
} = process.env;


if (!PROJECT_ID || !DEPLOYMENTID) {
  throw new Error("PROJECT_ID or DEPLOYMENTID missing");
}

/* ---------------- S3 CLIENT ---------------- */

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

/* ---------------- KAFKA ---------------- */

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: [KAFKA_BROKER1],
  ssl: {
    ca: [fs.readFileSync(KAFKA_CA_PATH, "utf-8")],
  },
  sasl: {
    mechanism: "plain",
    username: KAFKA_SASL_USERNAME,
    password: KAFKA_SASL_PASSWORD,
  },
});

const producer = kafka.producer();

/* ---------------- LOG PUBLISHER ---------------- */

async function publishLog(level, stage, message) {
  return producer.send({
    topic: "frontend-builder-logs",
    messages: [
      {
        key: "log",
        value: JSON.stringify({
          PROJECT_ID,
          DEPLOYMENTID,
          level,
          stage,
          message,
          ts: Date.now(),
        }),
      },
    ],
  }).catch(() => {});
}

/* ---------------- SAFE EXIT ---------------- */

let exiting = false;
async function safeExit(code, reason) {
  if (exiting) return;
  exiting = true;

  try {
    if (reason) {
      await publishLog("INFO", "SHUTDOWN", reason);
    }
    await producer.disconnect();
  } catch (_) {}
  finally {
    process.exit(code);
  }
}

process.on("SIGINT", () => safeExit(130, "SIGINT"));
process.on("SIGTERM", () => safeExit(143, "SIGTERM"));

/* ---------------- MAIN ---------------- */

async function init() {
  await producer.connect();

  await publilishEvent(
    "FRONTEND_PROCESSING",
    PROJECT_ID,
    DEPLOYMENTID,
    { frontendDir: FRONTENDPATH }
  );

  await publishLog("INFO", "INIT", "Frontend build started");

  const outputDir = path.join("/home/app", "output");
  const frontendPath = path.join(outputDir, FRONTENDPATH || ".");

  if (!fs.existsSync(frontendPath)) {
    await publilishEvent(
      "FRONTEND_BUILT_FAILED",
      PROJECT_ID,
      DEPLOYMENTID,
      { msg: "Frontend path does not exist" }
    );
    return safeExit(1, "Invalid frontend path");
  }

  const build = exec(`cd ${frontendPath} && ${INSTALLCOMMAND} && ${BUILDCOMMAND}`);

  build.stdout.on("data", d =>
    publishLog("INFO", "BUILD", d.toString().trim())
  );

  build.stderr.on("data", d =>
    publishLog("ERROR", "BUILD", d.toString().trim())
  );

  build.on("close", async (code) => {
    if (code !== 0) {
      await publilishEvent(
        "FRONTEND_BUILT_FAILED",
        PROJECT_ID,
        DEPLOYMENTID,
        { msg: `Build failed with exit code ${code}` }
      );
      return safeExit(code, "Build failed");
    }

    try {
      const distPath = path.join(frontendPath, "dist");

      if (!fs.existsSync(distPath)) {
        throw new Error("dist folder missing");
      }

      const files = readDirRecursive(distPath);

      for (const file of files) {
        const fullPath = path.join(distPath, file);
        if (fs.lstatSync(fullPath).isDirectory()) continue;

        await s3Client.send(new PutObjectCommand({
          Bucket: "veren-v2",
          Key: `__outputs/${PROJECT_ID}/${file}`,
          Body: fs.createReadStream(fullPath),
          ContentType: mime.lookup(fullPath) || "application/octet-stream",
        }));
      }

      await publilishEvent(
        "FRONTEND_BUILT_SUCCESS",
        PROJECT_ID,
        DEPLOYMENTID,
        { output: `s3://veren-v2/__outputs/${PROJECT_ID}` }
      );

      await publishLog("SUCCESS", "BUILD", "Frontend build completed");
      await safeExit(0, "Success");

    } catch (err) {
      await publilishEvent(
        "FRONTEND_BUILT_FAILED",
        PROJECT_ID,
        DEPLOYMENTID,
        { msg: err.message }
      );
      await safeExit(1, "Upload failed");
    }
  });
}

init().catch(async (err) => {
  await publilishEvent(
    "FRONTEND_BUILT_FAILED",
    PROJECT_ID,
    DEPLOYMENTID,
    { msg: err.message }
  );
  await safeExit(1, "Init failed");
});

/* ---------------- TIMEOUT ---------------- */

setTimeout(async () => {
  await publilishEvent(
    "FRONTEND_BUILT_FAILED",
    PROJECT_ID,
    DEPLOYMENTID,
    { msg: "Build timed out" }
  );
  await safeExit(124, "Timeout");
}, 10 * 60 * 1000);
