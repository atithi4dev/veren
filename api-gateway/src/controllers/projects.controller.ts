import { Request, Response } from "express";
import { Project, IProject, } from "@veren/domain";
import ApiError from "../utils/api-utils/ApiError.js";
import ApiResponse from "../utils/api-utils/ApiResponse.js";
import asyncHandler from "../utils/api-utils/asyncHandler.js";
import logger from "../logger/logger.js";
import { registerGithubWebhook } from "../services/github.service.js";

/* THIS IS ONLY ACCESIBLE TO FRONTEND USER */
const createFrontendProject = asyncHandler(async (req: Request, res: Response) => {
    const {
        projectName,
        type = "frontend",
        gitUrl,
        branch,
        entryDirectory,
        installCommand,
        buildCommand,
        buildOutDirectory,
        version = "20" } = req.body;

    const projectData = {
        name: projectName.toLowerCase(),
        type: type,
        git: {
            provider: "github",
            repoUrl: gitUrl,
            branch,
            rootDir: "./"
        },
        frontendBuild: {
            framework: "",
            installCommand,
            buildCommand,
            version,
            outDir: buildOutDirectory,
        },
        entryDirectory,
        envs: [],
        runtime: {
            type: "static"
        },
        domains: {
            subdomain: `https://${projectName.toLowerCase()}.veren.site`,
        },
        createdBy: req.user?.id
    }

    let project;
    try {
        project = await Project.create(projectData);
    } catch (error: any) {
        logger.error(`INSIDE MONGO ERROR CATCHED ${error}`)
        if (error.code == 11000) {
            return res.status(409).json({
                error: "Project name already taken"
            })
        }
        throw new ApiError(500, "Internal Server Error");
    }

    if (!project) {
        logger.info("Not of project error")
        throw new ApiError(500, "Unable to Create Project at the moment.")
    }
    try {
        await registerGithubWebhook(project.git.repoUrl, req.session.githubToken!, project._id.toString())
    } catch (error) {
        await Project.findOneAndDelete({_id: project.id});
    }
    return res.status(201).json(
        new ApiResponse(201, { sucess: true, project }, "Project created Successfully")
    )
})

const createBackendProject = asyncHandler(async (req: Request, res: Response) => {
    const {
        projectName,
        type = "backend",
        gitUrl,
        branch,
        version,
        entryDirectory,
        installCommand,
        runCommand,
    } = req.body;

    const projectData = {
        name: projectName.toLowerCase(),
        type: type,
        git: {
            provider: "github",
            repoUrl: gitUrl,
            branch,
            rootDir: "./"
        },
        backendBuild: {
            installCommand,
            runCommand,
            version
        },
        entryDirectory,
        envs: [],
        runtime: {
            type: "server"
        },
        domains: {
            subdomain: `https://api-${projectName.toLowerCase()}.veren.site`,
        },
        createdBy: req.user?.id
    }

    let project;
    try {
        project = await Project.create(projectData);
    } catch (error: any) {
        logger.error(`INSIDE MONGO ERROR CATCHED ${error}`)
        if (error.code == 11000) {
            return res.status(409).json({
                error: "Project name already taken"
            })
        }
        throw new ApiError(500, "Internal Server Error");
    }

    if (!project) {
        logger.info("Not of project error")
        throw new ApiError(500, "Unable to Create Project at the moment.")
    }
    try {
        await registerGithubWebhook(project.git.repoUrl, req.session.githubToken!, project._id.toString())
    } catch (error) {
        await Project.findOneAndDelete({_id: project.id});
    }
    
    return res.status(201).json(
        new ApiResponse(201, { sucess: true, project }, "Project created Successfully")
    )
})

const getAllProjects = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const projects = await Project.find({ createdBy: userId })
        .select("-envs")
        .populate({
            path: "createdBy",
            select: "_id name userName avatar"
        }).lean()

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

const deleteProject = asyncHandler(async (req: Request, res: Response) => {

})

const rollbackProject = asyncHandler(async (req:Request, res: Response)=>{
    const {projectId} = req.body;
    if(!projectId){
        throw new ApiError(404, "Project with project id not found.");
    }
    
    const project = await Project.findById(projectId);
    
    if(!project){
        throw new ApiError(404, "Project with project id not found.");
    }

    if(project.type === "frontend"){
        // get artifact url , 
        //  if old saved, swap , and delete new one
        // if current is first deployment , no rollback allowed
        // if    
    }else if(project.type === "backend"){

    }else{
        throw new ApiError(500, "Internal Server Error.");
    }

    return res.status(200).json({msg:"Project queued for rollback."});

})

export {
    createBackendProject, createFrontendProject, getAllProjects, rollbackProject
}