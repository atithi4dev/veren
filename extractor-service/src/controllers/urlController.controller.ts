
import { Request, Response } from "express";
import { cloneRepo } from "../services/GitHandler/gitHandler.js";
import axios from "axios";
export default async function urlController(req: Request, res: Response) {
  
  const {urls:{repoUrl,frontend, backend},id, token} = req.body;

  if(!id || !frontend || !backend){
    return res.status(400).json({ success: false, message: "id and urls are required" });
  }
  
  console.log("TIME FOR FORK:", repoUrl);

  try {
    const {projectId, baseDir, backendDir, frontendDir} = await cloneRepo(repoUrl, frontend, backend, id, token);
    
 
    console.log("SENDING REQUEST TO BACKEND SERVICE FOR OPERATIONAL CHECK");
    /// WILL BE REMOVED AFTER ADDING REDIS + BULLMQ PIPELINE  and will be using direct pascalls using main functional pipeline

    // ----------------------------------------------------
    const response = await axios.post(
      "http://backend-service:3000/api/v1/operational",
      { id:projectId },
      { timeout: 10000 }
    );
    // ----------------------------------------------------

    console.log("Response from router service:", response.data);

    console.log("CLONED:", projectId, baseDir, backendDir, frontendDir);
    
    return res.json({
      success: true,
      id: projectId,
      repoUrl,
      token,
      dir:{baseDir, backendDir, frontendDir},
      services: {
        backend: `${process.env.BASEURI}/backend/${projectId}`,
        frontend: `${process.env.BASEURI}/frontend/${projectId}`,
      },
      message: `Repo cloned successfully into ${baseDir}`
    });
  } catch (error) {
    
  }

  return res.json({ success: true, id, frontend, backend, message: "URL accepted by extractor-service" });
}
