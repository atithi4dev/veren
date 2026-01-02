console.log("REDIS_URL =", process.env.REDIS_URL);
const { exec } = require("child_process");
const path = require("path");
const readDirRecursive = require("./utils/readDirRecursive");
const fs = require("fs");
const mime = require('mime-types');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const redis = require("redis");

const s3Client = new S3Client({
    region: 'ap-south-1', credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const publisher = redis.createClient({
    username: 'default',
    password: 'hBDJYuzav1kvaIk0ayQjgdXvHJZydog5',
    socket: {
        host: 'redis-16711.c98.us-east-1-4.ec2.cloud.redislabs.com',
        port: 16711
    }
});

const PROJECT_ID = process.env.PROJECT_ID;

async function publishLog(log) {
    if (!publisher.isOpen) return;
   await publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({ message: log }))
}

const shutdown = async (signal) => {
  console.log("Shutting down:", signal);

  try {
    if (publisher.isOpen) {
      await publisher.quit();
    }
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);


async function init() {
    await publisher.connect();
    console.log("Executing script.js");
    await publishLog("Build Started")
    const outDirPath = path.join(__dirname, "output")
    const frontendPath = path.join(outDirPath, process.env.FRONTENDPATH || "./");
    const buildCommand = process.env.BUILDCOMMAND || "npm run build";
    const installCommand = process.env.INSTALLCOMMAND || "npm install";
    const _process = exec(`cd ${frontendPath} && ${installCommand} && ${buildCommand}`)

    _process.stdout.on('data', async function (data) {
        console.log(data.toString())
        await publishLog(data.toString())
    })

    _process.stderr.on("data", async function (data) {
        console.log("Error", data.toString())
        await publishLog("Error", data.toString())
    })

    _process.on('close', async function () {
        try {
            console.log("Build complete")
            publishLog("Build complete")

            const distFolderPath = path.join(frontendPath, "dist")

            if (!fs.existsSync(distFolderPath)) {
                throw new Error("Build failed: dist folder does not exist");
            }

            const distFolderContents = readDirRecursive(distFolderPath)

            publishLog("Starting to upload")

            for (const file of distFolderContents) {
                const filePath = path.join(distFolderPath, file)
                if (fs.lstatSync(filePath).isDirectory()) continue;

                console.log('uploading', filePath)
                publishLog(`Uploading ${file}`)

                const command = new PutObjectCommand({
                    Bucket: 'veren-v2',
                    Key: `__outputs/${PROJECT_ID}/${file}`,
                    Body: fs.createReadStream(filePath),
                    ContentType: mime.lookup(filePath)
                });

                await s3Client.send(command);
                publishLog(`Uploaded ${file}`);

                console.log("uploaded", filePath)
            }
        } catch (error) {
            console.error("Error uploading files:", error);
            await publishLog("Error uploading files:" + error);
        } finally {
 
        }
    })
}

init();