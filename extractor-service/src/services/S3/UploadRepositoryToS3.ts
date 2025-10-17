import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path, { dirname } from "path";
import readDirRecursive from "../../utils/readDirRecursive.js";
import fs from "fs";
import mime from "mime-types";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const s3Client = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.accessKeyId as string,
        secretAccessKey: process.env.secretAccessKey as string
    }
});

async function uploadToS3(directoryPathToRepo: string, projectId: string) {
    try {
        const RepoFolderPath = path.join(__dirname, '../../../clones', projectId)

        const repoFolderContents = readDirRecursive(RepoFolderPath)

        await Promise.all(repoFolderContents.map(async (file) => {
            const filePath = path.join(RepoFolderPath, file);
            if (fs.lstatSync(filePath).isDirectory()) return;

            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET as string,
                Key: `__outputs/${projectId}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath) || "application/octet-stream",
            });

            await s3Client.send(command);
        }));

        console.log("REPOSITORY UPLOADED");

    } catch (error) {
        console.error("Error uploading files:", error);
    }
}

export { uploadToS3 }