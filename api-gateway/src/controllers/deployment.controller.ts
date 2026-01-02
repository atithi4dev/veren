import axios from "axios";
import asyncHandler from "../utils/api-utils/asyncHandler.js";
import { Request, Response } from "express";
import ApiError from "../utils/api-utils/ApiError.js";
import Project from "../models/project.model.js";
import Deployment from "../models/deployment.model.js";

const deployProject = asyncHandler(async (req: Request, res: Response) => {
  try {
    {
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

  await axios.post(
    "http://extractor-service:3000/api/v1/url",
    {
      projectId,
      owner: userId,
      deploymentId: newDeployment._id,
      token: req.session.githubToken,
      repoUrl: project?.git?.repoUrl,
      dirPath: project?.repoPath,
      build: project?.build
    },
    { timeout: 2000 }

  ).catch(error => {
    throw new ApiError(500, `Extractor service failed: ${error}`);
  });

  return res.status(200).json({ message: "Deployment triggered successfully" });

}
  } catch (error) {
  console.log(error);   
  }
})

const deployTo = asyncHandler(async (req: Request, res: Response) => {
  // const { projectId }= req.body;
  // const lastDeployment = await Deployment.findOne({ projectId })
  // .sort({ number: -1 })
  // .select("number");
})

export {
  deployProject, deployTo
}