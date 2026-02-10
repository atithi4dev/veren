import { Request, Response } from "express";
import logger from "../logger/logger.js";

export default function healthCheck(req: Request, res: Response){
    logger.info("API Gateway health check endpoint accessed");
    res.status(200).json({msg:"OKAY ITS WORKING"})    
}