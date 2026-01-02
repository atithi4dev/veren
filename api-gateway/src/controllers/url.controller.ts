import { Request, Response } from "express";
import axios from "axios";

// REMOVE AFTER UPDATES IN OTHER MAIN ROUTES
export async function handleFirstDeployment(req: Request, res: Response) {
  // try {
  //   const {
  //     projectName,
  //     url,
  //     frontendPath,
  //     backendPath,
  //     frontendEnv,
  //     backendEnv,
  //     FrontendBuildCommand,
  //     BackendBuildCommand
  //   } = req.body;

  //   if (!url || !req.session.githubToken) {
  //     return res.status(400).json({ success: false, message: "URL and valid session token are required" });
  //   }

  //   if (!frontendPath || !backendPath) {
  //     return res.status(400).json({ success: false, message: "Both frontendPath and backendPath are required" });
  //   }
  //   console.log("Forwarding request to submission service...");

  //   const repoConfig = {
  //     envs: {
  //       frontendEnv,
  //       backendEnv
  //     },
  //     buildCommand: {
  //       FrontendBuildCommand: "npm run build",
  //       BackendBuildCommand: "npm run build",
  //     }
  //   }

  //   const pathToFolder = {
  //     frontendPath,
  //     backendPath,
  //   }
  //   const response = await axios.post(
  //     "http://submission-service:3000/api/v1/url",
  //     {
  //       projectName,
  //       url,
  //       pathToFolder,
  //       repoConfig,
  //       token: req.session.githubToken
  //     },
  //     { timeout: 10000 }
  //   );

  //   console.log("Response from submission service:", response.data);

  //   return res.json({
  //     success: true,
  //     message: "Please wait while we process your request",
  //   });
  // } catch (error: any) {
  //   return res.status(500).json({ success: false, error: error.message });
  // }
}


export async function  handleEnvironmentVariable(req:Request, res: Response) {
  
}