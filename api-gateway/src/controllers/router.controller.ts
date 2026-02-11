import { Request, Response } from "express";
import axios from "axios";
import logger from "../logger/logger.js";

// HANDLE URL PATH (FORWARD FOR PREPROCESSING)
export async function RouteHandler(req: Request, res: Response) {
  try {
    const response = await axios.post(
      "http://routing-service:3000/api/v1/url",
      { path:req.path, token: req.session.githubToken },
      { timeout: 10000 }
    );
    
    logger.info("Response from router service:", response.data);

    return res.json({
      success: true,
      message: "Please wait while we process your request",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}