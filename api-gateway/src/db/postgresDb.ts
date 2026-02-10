import { Pool, Client } from 'pg';
import logger from "../logger/logger.js";

const user = process.env.POSTGRES_USER
const password = process.env.POSTGRES_PASSWORD
const host = process.env.POSTGRES_HOST || 'localhost'
const port = process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432;
const database = process.env.POSTGRES_DB


if (!user || !password || !host || !database) {
  throw new Error("Missing environment variables. Please ensure POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, and POSTGRES_DB are set.");
}

const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;

const pool = new Pool({
    connectionString
})

async function testConnection() {
    try {

    } catch (error) {
        logger.error('Error connecting to the POSTGRES:', { error });
    }
}

export { pool };