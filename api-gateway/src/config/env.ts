import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Database
    MONGO_CONN_STRING: z.url().default("mongodb://localhost:27017/verenDB"),

    // AWS / Queue
    AWS_ACCESS_KEY_ID: z.string().min(1, "AWS_ACCESS_KEY_ID is required"),
    AWS_SECRET_ACCESS_KEY: z.string().min(1, "AWS_SECRET_ACCESS_KEY is required"),
    SERVICE_QUEUE_URL: z.url(),
    REDIS_HOST: z.string().default("internal-redis"),

    // Auth / Secrets
    GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
    GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),
    ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET is required"),
    REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required"),
    SESSION_SECRET: z.string().default("default_secret"),

    // Frontend
    FRONTEND_URL: z.url(),
    CORS_ORIGIN: z.string().default("*"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    const { fieldErrors } = z.flattenError(parsed.error);
    Object.entries(fieldErrors).forEach(([key, value]) => {
        if (value?.length) {
            console.error(`- ${key}: ${value.join(", ")}`);
        }
    });


    process.exit(1);
}

export const env = parsed.data;
