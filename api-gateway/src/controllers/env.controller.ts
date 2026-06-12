import { Request, Response } from "express";
import asyncHandler from "../utils/api-utils/asyncHandler.js";
import ApiError from "../utils/api-utils/ApiError.js";
import { Project } from "@veren/domain";
import ApiResponse from "../utils/api-utils/ApiResponse.js";

const getEnv = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;

    const user = req.user;

    if (!user) {
        throw new ApiError(404, "User Not Found.");
    }
    try {
        const project = await Project.findById(projectId);

        if (!project) {
            throw new ApiError(404, "Project Not Found.");
        }

        if (project.createdBy.toString() !== user.id) {
            throw new ApiError(401, "Unauthorized.");
        }

        const envs = project.envs;

        return res.status(200).json(new ApiResponse(200, envs, "Envs found for the project."));
    } catch (error) {
        throw new ApiError(500, "Internal Server Error");
    }
})

const updateEnv = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { envs } = req.body;

    if (!projectId) {
        throw new ApiError(404, "Project id not found.");
    }

    if (!envs) {
        throw new ApiError(404, "Envs are not found.");
    }
    try {

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            {
                envs
            },
            {
                new: true
            }
        )
        if (!updatedProject) {
            return res.status(404).json({ message: "Project not found" });
        }

        return res.status(200).json(updatedProject);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
})

export {
    updateEnv,
    getEnv
}