import { Request, Response } from "express";
import Project from "../models/project.model.js";
import ApiError from "../utils/api-utils/ApiError.js";
import asyncHandler from "../utils/api-utils/asyncHandler.js";
import axios from "axios";
import config from "../types/configuration/index.js";
import { safeExecute } from "../utils/api-utils/SafeExecute.js";
import Deployment from "../models/deployment.model.js";

// Update new configuration and request backend for build progress by passing the data 
const updateProjectConfigClone = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, config, deploymentId, commitHash, commitMessage } = req.body;
  let {
    frontendConfig,
    backendConfig,
  } = config as config;

  if (!projectId) {
    throw new ApiError(404, "Project Id is not found")
  }

  if (!deploymentId || typeof deploymentId !== "string") {
    throw new ApiError(400, "Project Id is required for deploying the site.")
  }

  if (!commitHash || !commitMessage || commitHash === "" || commitMessage === "") {
    throw new ApiError(404, "Metadata not found to update the deployment Config");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project Not found")
  }

  const userId = project.createdBy.toString();

  const frontendEnv = project.envs.frontendEnv;
  const backendEnv = project.envs.backendEnv;
  const url = project.git.repoUrl

  const deployment = await Deployment.findById(deploymentId);

  if (!deployment) {
    throw new ApiError(404, "Deployment Not Found");
  }
  if (deployment.owner.toString() != userId) {
    throw new ApiError(401, "Unauthorized");
  }
  await Deployment.updateOne(
    { _id: deploymentId },
    {
      $set: {
        commitHash,
        commitMessage,
        status: "building"
      }
    }
  )

  await safeExecute(
    () => axios.post(
      "http://backend-service:3000/api/v1/operational",
      {
        url,
        projectId: project.name,
        deploymentId,
        frontendConfig: { ...frontendConfig, frontendEnv },
        backendConfig: { ...backendConfig, backendEnv },
      },
      { timeout: 10000 }
    ),
    null
  );
})

const updateProjectConfigBuild = asyncHandler(async (req: Request, res: Response) => {

})
const getProjectConfigBuild = asyncHandler(async (req: Request, res: Response) => {

})


export {
  updateProjectConfigClone,
  updateProjectConfigBuild,
  getProjectConfigBuild
}