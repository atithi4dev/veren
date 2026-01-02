import { Request, Response } from "express";
import { buildQueue } from "../queue/build-queue.js";
import { safeExecute } from "../types/safeExecute.js";

export default async function operationalController(req: Request, res: Response) {
    const {
        url,
        projectId,
        deploymentId,
        frontendConfig,
        backendConfig,
    } = req.body;

    await buildQueue.add(
        "buildQueue",
        {   url,
            projectId,
            deploymentId,
            frontendConfig,
            backendConfig,
        },
        {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
        }
    )

    console.log("OPERATIONAL CHECK FOR ID:", projectId);

    return res.json({ msg: "Operational controller is working", projectId });
}