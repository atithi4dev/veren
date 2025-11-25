import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
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

// Helper: Break array into chunks
function chunkArray<T>(arr: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

async function uploadToS3(directoryPathToRepo: string, projectId: string) {
    try {
        const RepoFolderPath = path.join(__dirname, "../../../clones", projectId, 'frontend','dist');

        const files = readDirRecursive(RepoFolderPath);

        const batches = chunkArray(files, 5);

        for (const batch of batches) {
            await Promise.all(
                batch.map(async (file) => {
                    const filePath = path.join(RepoFolderPath, file);

                    if (fs.statSync(filePath).isDirectory()) return;

                    const command = new PutObjectCommand({
                        Bucket: process.env.S3_BUCKET as string,
                        Key: `__outputs/${projectId.toLowerCase()}/${file}`,
                        Body: fs.createReadStream(filePath),
                        ContentType: mime.lookup(filePath) || "application/octet-stream",
                    });

                    await s3Client.send(command);
                })
            );

            console.log(`Uploaded batch of ${batch.length} files`);
        }

        console.log("REPOSITORY UPLOADED");

    } catch (error) {
        console.error("Error uploading files:", error);
    }
}

export { uploadToS3 };
