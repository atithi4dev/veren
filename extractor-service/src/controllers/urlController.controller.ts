import { Request, Response } from "express";
import { cloneQueue } from "../queue/clone-queue.js";
import ApiError from "../utils/ApiError.js";
import logger from "../logger/logger.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

const urlController = asyncHandler(async (req: Request, res: Response) => {
  const {
    projectId,deploymentId, token, repoUrl, dirPath, build
  } = req.body;

  if (!projectId) {
    return res.status(400).json({ success: false, message: "Project Id is required." });
  }
  if (!token) {
    return res.status(400).json({ success: false, message: "GitHub token is required." });
  }

  try {
    await cloneQueue.add(
      "cloneQueue",
      {
        projectId,
        deploymentId,
        token,
        repoUrl,
        dirPath,
        build
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
    logger.info(`Clone job added for project ${projectId}`);

  } catch (error) {
    logger.error(`Error while in Extractor service for projectId: `, projectId);
    throw new ApiError(500, "Internal server error!");
  }
  return res.status(200).json(new ApiResponse(200, { id: projectId }, `Repo under clone phase`))
}
)

export default urlController;