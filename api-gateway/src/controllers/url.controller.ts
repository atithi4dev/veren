import { Request, Response } from "express";
import axios from "axios";

// HANDLE URL PATH (FORWARD FOR PREPROCESSING)
export async function handleUrl(req: Request, res: Response) {
  try {
    console.log("Request received at API Gateway");
    console.log("BODY OF REQUEST:", req.body);
    const { url, frontendPath, backendPath, frontendEnv , backendEnv } = req.body;
    console.log("SESSION: ", req.session);

    if (!url || !req.session.githubToken) {
      return res.status(400).json({ success: false, message: "URL and valid session token are required" });
    }

    if(!frontendPath || !backendPath) {
      return res.status(400).json({ success: false, message: "Both frontendPath and backendPath are required" });
    }

    console.log("Forwarding request to submission service...");

    const response = await axios.post(
      "http://submission-service:3000/api/v1/url",
      { url, frontendPath, backendPath, frontendEnv , backendEnv, token: req.session.githubToken },
      { timeout: 10000 }
    );
    console.log("Response from submission service:", response.data);

    return res.json({
      success: true,
      message: "Please wait while we process your request",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}