import { Request, Response } from "express";
import {Project, IProject} from "@veren/domain";
import ApiError from "../utils/api-utils/ApiError.js";
import ApiResponse from "../utils/api-utils/ApiResponse.js";
import asyncHandler from "../utils/api-utils/asyncHandler.js";
import logger from "../logger/logger.js";

/* THIS IS ONLY ACCESIBLE TO FRONTEND USER */
const createProject = asyncHandler(async (req: Request, res: Response) => {
    const {
        name,
        repoUrl,
        branch = "main",
        frontendDirPath = "./frontend",
        backendDirPath = "./backend",
        frontendBuildCommand = "npm run build",
        frontendInstallCommand = "npm install",
        backendInstallCommand = "npm install",
        backendStartCommand = "npm start",
        frontendOutDir = "./build",
    } = req.body;

    if (!name || !repoUrl) {
        throw new ApiError(400, "Name and repoUrl are required");
    }

    const projectData = {
        name: name.toLowerCase(),
        git: {
            provider: "github",
            repoUrl,
            branch,
            rootDir: "./"
        },
        repoPath: {
            frontendDirPath,
            backendDirPath
        },
        build: {
            frontendBuildCommand,
            frontendInstallCommand,
            backendInstallCommand,
            backendStartCommand,
            frontendOutDir
        },
        runtime: {
            frontend: {
                type: "static"
            },
            backend: {
                type: "server",
                port: 8080
            }
        },
        envs: {
            frontendEnv: [],
            backendEnv: []
        },
        domains: {
            subdomain: `https://${name.toLowerCase()}.veren.site`,
        },
        createdBy: req.user?.id
    }
    let project;
    try {
        project = await Project.create(projectData)
    } catch (error: any) {
        if (error.code == 11000) {
            logger.info("INSIDE MONGO ERROR CATCHED", error.message)
            return res.status(409).json({
                error: "Project name already taken"
            })
        }
        logger.info("INSIDE MONGO ERROR CATCHED", error.message)
        throw new ApiError(500, "Internal server error");
    }

    if (!project) {
        logger.info("Not of project error")
        throw new ApiError(500, "Unable to Create Project At the moment.");
    }

    return res.status(201).json(
        new ApiResponse(201, {success: true, project},"Project created successfully")
    )
})

const getAllProjects = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const projects = await Project.find({ createdBy: userId })
        .select({
            name: 1,
            "domains.subdomain":1,
            createdBy: 1,
            _id:1
        })
        .populate({
            path: "createdBy",
            select: "_id name userName avatar"
        })

    return res.status(200).json(
        new ApiResponse(200, projects, "Fetched user projects successfully")
    );
})

const getProjectConfigUser = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;

    if (!projectId) {
        throw new ApiError(400, "ProjectId is missing");
    }

    const project = await Project.findById(projectId)
    if (!project) {
        throw new ApiError(404, "Project Not found");
    }

    return res.status(200).json(new ApiResponse(200, project, "Fetched Project details successfully"))

})

const updateProjectConfigUser = asyncHandler(async (req: Request, res: Response) => {

})

const deleteProject = asyncHandler(async (req:Request, res:Response)=>{
    
})

export {
    createProject, getAllProjects, getProjectConfigUser,
}