import { Request, Response } from "express";
// import { fileURLToPath } from "url";
// import path from "path";
// import { promises as fs } from "fs";
import { nanoid } from "nanoid";
import axios from "axios"
import { error } from "console";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const dataFilePath = path.join(__dirname, "../", "data.json");

export default async function urlController(req: Request, res: Response) {
  try {
    const { url, frontendPath, backendPath, frontendEnv, backendEnv, token } = req.body;
    console.log("urlController called with URL:", url);

    if (!url || !token) {
      return res.status(400).json({ success: false, message: "URL and token are required" });
    }

    // MAINTAIN A DISK DATABASE (data.json file)
    // let data: Array<{ id: string; url: string, token: string }> = [];
    // try {
    //   const raw = await fs.readFile(dataFilePath, "utf-8");
    //   data = JSON.parse(raw);
    // } catch (err) {
    //   data = [];
    // }

    // Generate UUID and push new entry
    const id: string = nanoid(8);
    // data.push({ id, url, token });

    // // Write back to file
    // await fs.writeFile(dataFilePath,
    //   JSON.stringify(data, null, 2), "utf-8");

    await axios.post(
      "http://extractor-service:3000/api/v1/url",
      {
        urls: {
          repoUrl: url,
          backend: `${url}/${backendPath}`,
          frontend: `${url}/${frontendPath}`,
        },
        id,
        token,
      },
       { timeout: 2000 }
    ).catch(error=>{
      console.error("Error communicating with extractor-service:", error.message);
    });

    return res.json({
      success: true,
      id,
      url,
      token,
      message: "URL accepted by submission-service",
    });
    
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}