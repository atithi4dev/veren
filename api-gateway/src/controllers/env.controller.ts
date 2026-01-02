// Env changes should trigger redeploys

import { Request, Response } from "express";
import asyncHandler from "../utils/api-utils/asyncHandler.js";
import ApiError from "../utils/api-utils/ApiError.js";
import Project from "../models/project.model.js";

const updateEnv = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { frontendEnv, backendEnv } = req.body;

    if (!projectId) {
        throw new ApiError(500, "Internal Server Error");
    }

    if (!frontendEnv || !backendEnv) {
        throw new ApiError(404, "Data not found");
    }
    try {

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            {
                //  ... here makes envs.frontendEnv a key of its parent Object and its value is set to FrontendEnv
                ...(frontendEnv && { "envs.frontendEnv": frontendEnv }),
                ...(backendEnv && { "envs.backendEnv": backendEnv })
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
    updateEnv
}