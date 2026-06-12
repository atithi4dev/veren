import { Request, Response } from 'express'
import asyncHandler from '../utils/api-utils/asyncHandler';
import { createClient } from "redis";
import mongoose from "mongoose";
import ClickHouseClient from '../db/initClickhouse.js'
import logger from '../logger/logger';
import ApiResponse from '../utils/api-utils/ApiResponse';
import ApiError from '../utils/api-utils/ApiError';

const consumerBufferClient = createClient({
    socket: { host: "internal-redis", port: 6379 }
});

async function redisConnector() {
    await consumerBufferClient.connect();
}

redisConnector();

consumerBufferClient.on("error", (err: any) => {
    logger.error("Connection to consumerBuffer Redis Failed : ", err);
})

// routes -- /logs/:deployementId/stream
const logStream = asyncHandler(async (req: Request, res: Response) => {
    const deploymentId = req.params.deploymentId;
    if (!mongoose.Types.ObjectId.isValid(deploymentId)) {
        throw new ApiError(400, "Invalid deployment id");
    }

    const stream = `logs:deploymentId:${deploymentId}`

    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let lastId = "0";
    let isClosed = false;

    req.on("close", () => {
        isClosed = true;
        res.end();
    })
    try {
        const resultSet = await ClickHouseClient.query({
            query: `
                SELECT *
                FROM log_events
                WHERE deployment_id = {deploymentId:String}
                ORDER BY ts DESC
            `,
            query_params: {
                deploymentId
            },
            format: "JSONEachRow"
        });

        const missedLogs = await resultSet.json();

        res.write(`data: ${JSON.stringify(missedLogs)}\n\n`);

        while (!isClosed) {
            let response: any = "";
            try {
                response = await consumerBufferClient.xRead(
                    [{ key: stream, id: lastId }],
                    { BLOCK: 5000 }
                )
            } catch (error: any) {
                logger.error("ConsumerBufferClient read failed", error)
            }

            if (!response) continue

            // Redis returns array of messages
            const messages = response[0].messages;

            for (const msg of messages) {
                lastId = msg.id;
                res.write(`data: ${JSON.stringify(msg.message)}\n\n`)
            }
        }
    } catch (error: any) {
        if (!res.writable) {
            res.end();
        }
    }
})

//  and /logs/:deploymentId/static?value=500
const logStatic = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { deploymentId } = req.params;

        const allowedLimits = [500, 1000, 2500, 5000];

        const requested = Number(req.query.value);

        const limit = allowedLimits.includes(requested) ? requested : 500;
        const offset = limit - 500;
        const fetchCount = 500;

        const resultSet = await ClickHouseClient.query({
            query: `
                SELECT *
                FROM log_events
                WHERE deployment_id = {deploymentId: String}
                ORDER BY ts DESC
                LIMIT {fetchCount: UInt32} 
                OFFSET {offset: UInt32}
            `,
            query_params: {
                deploymentId,
                fetchCount,
                offset
            },
            format: "JSONEachRow"
        });
        const logs = await resultSet.json();

        res.status(200).json(new ApiResponse(200, logs, "Logs fetched succesfuilly"));

    } catch (error) {
        throw new ApiError(500, "Internal Server Error");
    }
})

// Make a call to aws to fetch backend logs continuosly

// get all logs from backendBuild just keep on storing

// serve the logs from backend, frontend based on history and deploymentId, if deploymentId not found get latestDeploymentId

export {
    logStream, logStatic
}