
import { Request, Response } from "express";
import { cloneQueue } from "../queue/clone-queue.js";

export default async function urlController(req: Request, res: Response) {
  const {
    url,
    pathToFolder,
    repoConfig,
    id,
    token
  } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, message: "Project Id is required." });
  }

  try {

    await cloneQueue.add(
      "cloneQueue",
      {
        url,
        pathToFolder,
        repoConfig,
        id,
        token
      },
      {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: true,
      }
    );

    return res.json({
      success: true,
      id: id,
      url,
      token,
      message: `Repo under clone phase`
    });
  } catch (error) {

  }

  return res.json({ success: true, id, message: "URL accepted by extractor-service" });
}
