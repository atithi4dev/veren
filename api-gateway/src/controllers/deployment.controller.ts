import { Request, Response } from "express";
import { createClient } from "redis"

import asyncHandler from "../utils/api-utils/asyncHandler.js";
import ApiError from "../utils/api-utils/ApiError.js";
import { frontendBuildQueue } from "../Queue/frontendBuild-queue.js";

import logger from "../logger/logger.js";

import { Project, DeploymentStatus, publishEvent } from "@veren/domain";
import { Deployment } from "@veren/domain";
import { backendBuildQueue } from "../Queue/backendBuild-queue.js";
import ApiResponse from "../utils/api-utils/ApiResponse.js";

const redis = createClient({
  socket: { host: "internal-redis", port: 6379 }
});

const deployProject = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;

  if (!projectId || typeof projectId !== "string") {
    throw new ApiError(400, "Project Id is required.");
  }

  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.createdBy.equals(userId)) {
    throw new ApiError(403, "Unauthorized");
  }

  if (!req.session.githubToken) {
    throw new ApiError(400, "GitHub token missing.");
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
    startedAt: Date.now(),
  });

  await Project.findByIdAndUpdate(projectId, {
    $set: { deployments: newDeployment._id,currentDeployment: newDeployment._id },
  });

  const jobOptions = {
    attempts: 1,
    backoff: {
      type: "exponential" as const,
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: true,
  };

  try {
    if (project.type === "frontend") {
      if (!project.frontendBuild?.outDir) {
        throw new ApiError(400, "Frontend outDir must be defined.");
      }
      const frontendJobData = {
        projectId: project._id.toString(),
        deploymentId: newDeployment._id.toString(),
        token: req.session.githubToken,
        repoUrl: project.git.repoUrl,
        frontendDirPath: project.entryDirectory,
        build: {
          installCommand: project.frontendBuild.installCommand,
          buildCommand: project.frontendBuild.buildCommand,
          outDir: project.frontendBuild.outDir,
          version: project.frontendBuild?.version
        },

        envs: project.envs,
      };

      await frontendBuildQueue.add("frontendBuildQueue", frontendJobData, jobOptions);
    }

    else if (project.type === "backend") {
      const backendJobData = {
        projectId: project._id.toString(),
        deploymentId: newDeployment._id.toString(),
        repoUrl: project.git.repoUrl,
        backendDirPath: project.entryDirectory,
        build: {
          installCommand: project.backendBuild?.installCommand,
          runCommand: project.backendBuild?.runCommand,
          version: project.backendBuild?.version
        },

        envs: project.envs,
      };

      await backendBuildQueue.add(
        "backendBuildQueue",
        backendJobData,
        jobOptions
      );
    }

    else {
      throw new ApiError(400, "Unsupported project type.");
    }

    await Deployment.findByIdAndUpdate(newDeployment._id, {
      status: "queued",
    });

    // // CACHING DEPLOYMENT DETAILS FOR LOOKUPS
    // await redis.set(
    //   `deployment:${newDeployment._id}`,
    //   JSON.stringify({ type: project.type }),
    //   { EX: 3600 }
    // )


    publishEvent({
      type: DeploymentStatus.CREATED,
      projectId: project._id.toString(),
      deploymentId: newDeployment._id.toString(),
      payload: {
        owner: userId,
        msg: "Queued for deployment.",
      },
    });

  } catch (error) {
    await Deployment.findByIdAndUpdate(newDeployment._id, {
      status: "failed",
    });

    throw new ApiError(500, "Failed to enqueue deployment job.");
  }

  return res
    .status(200)
    .json({ message: "Deployment triggered successfully.", deploymentId: newDeployment._id });
});

const getDeployment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { deploymentId } = req.params;

  if (!userId) throw new ApiError(401, "Unauthorized");

  const deployment = await Deployment.findOne({
    _id: deploymentId,
    owner: userId
  })
    .select("-backendECSContainerArn")
    .lean();

  if (!deployment) throw new ApiError(404, "Deployment not found");

  return res.status(200).json(
    new ApiResponse(200, deployment, "Fetched deployment successfully")
  );
});

const getAllUserDeployment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { projectId } = req.query;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const filter: any = { owner: userId };
  if (projectId) filter.projectId = projectId;

  const deployments = await Deployment.find(filter)
    .select("-backendECSContainerArn")
    .sort({ createdAt: -1 })
    .populate({
      path: "owner",
      select: "_id name userName avatar"
    })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, deployments, "Fetched deployments successfully")
  );
});

const deployTo = asyncHandler(async (req: Request, res: Response) => {
  // const { projectId }= req.body;
  // const lastDeployment = await Deployment.findOne({ projectId })
  // .sort({ number: -1 })
  // .select("number");
})

const roleBackProject = asyncHandler(async (req: Request, res: Response) => {

})

export {
  deployProject, getDeployment, getAllUserDeployment, deployTo, roleBackProject
}