
import { Request, Response } from "express";
import { cloneQueue } from "../job/queue/clone-queue.js";

export default async function urlController(req: Request, res: Response) {
  const {urls:{repoUrl,frontend, backend},id, token} = req.body;

  if(!id || !frontend || !backend){
    return res.status(400).json({ success: false, message: "id and urls are required" });
  }
  
  console.log("TIME FOR FORK:", repoUrl);

  try {

    // QUEUE FOR CLONE + BUILD + (DOCKERFILE -- ON HOLD)
     await cloneQueue.add(
      "cloneQueue",
      {
       repoUrl, frontend, backend, id, token
      },
      {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: true,
      }
    );

    /// WILL BE REMOVED AFTER ADDING REDIS + BULLMQ PIPELINE  and will be using direct pascalls using main functional pipeline

    // REMOVE
    // ----------------------------------------------------
    // const response = await axios.post(
    //   "http://backend-service:3000/api/v1/operational",
    //   { id:id },
    //   { timeout: 10000 }
    // );
    // ----------------------------------------------------
    // console.log("Response from router service:", response.data);

    return res.json({
      success: true,
      id: id,
      repoUrl,
      token,
      message: `Repo under clone phase`
    });
  } catch (error) {
    
  }

  return res.json({ success: true, id, frontend, backend, message: "URL accepted by extractor-service" });
}
