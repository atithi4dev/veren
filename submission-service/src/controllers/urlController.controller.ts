import { Request, Response } from "express";
// import { fileURLToPath } from "url";
// import path from "path";
// import { promises as fs } from "fs";
import { nanoid } from "nanoid";
import axios from "axios"
import { error } from "console";
import { env } from "process";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const dataFilePath = path.join(__dirname, "../", "data.json");

export default async function urlController(req: Request, res: Response) {
  try {
    const { 
      projectName,
      url,
      pathToFolder,
      repoConfig, 
      token
    } = req.body;

    console.log("urlController called with URL:", url);

    if (!url || !token) {
      return res.status(400).json({ success: false, message: "URL and token are required" });
    }
    const uid: string = nanoid(8).toLowerCase();

    await axios.post(
      "http://extractor-service:3000/api/v1/url",
      {
        url,
        pathToFolder,
        repoConfig,
        // id:projectName? projectName:uid,
        id:uid,
        token,
      },
      { timeout: 2000 }
    ).catch(error => {
      console.error("Error communicating with extractor-service:", error.message);
    });

    return res.json({
      success: true,
      id :projectName? projectName:uid,
      url,
      token,
      message: "URL accepted by submission-service",
    });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}