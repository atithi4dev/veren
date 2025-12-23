import { Request, Response } from "express";
import { buildQueue } from "../queue/build-queue.js";
import { safeExecute } from "../types/safeExecute.js";

export default async function operationalController(req: Request, res: Response) {

    const {
        url,
        pathToFolder,
        repoConfig,
        token,
        projectId,
        dirPath,
        cloneSkipped
    } = req.body;

    if (cloneSkipped) {
        console.log("Cloning or assigning was skipped, not queuing build.");
        return res.json({ msg: "Cloning or assigning was skipped, not queuing build." });
    }
    await buildQueue.add(
        "buildQueue",
        {
            url,
            pathToFolder,
            repoConfig,
            token,
            projectId,
            dirPath,
            cloneSkipped,
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