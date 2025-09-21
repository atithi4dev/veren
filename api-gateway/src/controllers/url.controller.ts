import { Request, Response } from "express";
import axios from "axios";

export async function handleUrl(req: Request, res: Response) {
  try {
    console.log("Request received at API Gateway");
    const { url } = req.body;

    const response = await axios.post(
      "http://submission-service:3000/api/v1/url",
      { url }
    );

    res.json({
      success: true,
      message: "Request forwarded successfully",
      data: response.data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}