import { Request, Response } from "express";

import asyncHandler from "../utils/api-utils/asyncHandler.js";
import ApiError from "../utils/api-utils/ApiError.js";

import { cloneQueue } from "../Queue/clone-queue.js";

import logger from "../logger/logger.js";

import { Project, DeploymentStatus, publishEvent } from "@veren/domain";
import { Deployment } from "@veren/domain";


const deployProject = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;

  if (!projectId || typeof projectId !== "string") {
    throw new ApiError(400, "Project Id is required for deploying the site.")
  }
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const isOwner = project.createdBy.equals(userId);

  if (!isOwner) {
    throw new ApiError(403, "Unauthorized");
  }

  const lastDeployment = await Deployment.findOne({ projectId })
    .sort({ number: -1 })
    .select("number");

  const nextNumber = lastDeployment ? lastDeployment.number + 1 : 1;

  const newDeployment = await Deployment.create({
    projectId: project._id,
    owner: userId,
    number: nextNumber,
    status: "queued",
    startedAt: Date.now()
  })

  await Project.findByIdAndUpdate(
    projectId,
    {
      $push: {
        deployments: newDeployment._id
      },
      $set: {
        currentDeployment: newDeployment._id
      }
    }
  );

  try {
    await cloneQueue.add(
      "cloneQueue",
      {
        projectId,
        owner: userId,
        deploymentId: newDeployment._id,
        token: req.session.githubToken,
        repoUrl: project?.git?.repoUrl,
        dirPath: project?.repoPath,
        build: project?.build,
      },
      {
        attempts: 1,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: true,
      }
    );

    logger.info(`Clone job added for project ${projectId}`);

    publishEvent({
      type: DeploymentStatus.CREATED,
      projectId: projectId,
      deploymentId: newDeployment._id.toString(),
      payload: {
        owner: userId,
        msg: "Queued for deployment."
      }
    })

  } catch (error) {
    logger.error(`Error while pushing to clone queue for projectId: `, projectId);
    throw new ApiError(500, "Internal server error!");
  }

  return res.status(200).json({ message: "Deployment triggered successfully." });
})

const roleBackProject = asyncHandler(async (req:Request, res: Response) =>{

})

const deployTo = asyncHandler(async (req: Request, res: Response) => {
  // const { projectId }= req.body;
  // const lastDeployment = await Deployment.findOne({ projectId })
  // .sort({ number: -1 })
  // .select("number");
})

export {
  deployProject, deployTo, roleBackProject
}