import { Request, Response } from "express";
import { Project } from "@veren/domain";
import ApiError from "../utils/api-utils/ApiError.js";
import asyncHandler from "../utils/api-utils/asyncHandler.js";
import axios from "axios";
import config from "../types/configuration/index.js";
import { safeExecute } from "../utils/api-utils/SafeExecute.js";
import { Deployment } from "@veren/domain";


const updateProjectConfigBuild = asyncHandler(async (req: Request, res: Response) => {
  // const { projectId, deploymentId, FrontendtaskArn, BackendtaskArn } = req.body;


  // try {

  // } catch (error: any) {
  //   return new ApiError(500, "Something went wrong while sending request to noti. service", error)
  // }
  // return res.status(200).json({
  //   status: "Recieved"
  // })
})

const getProjectConfigBuild = asyncHandler(async (req: Request, res: Response) => {

})


export {
  updateProjectConfigBuild,
  getProjectConfigBuild
}