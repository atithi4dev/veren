import { Request, Response } from "express";
import logger from "../logger/logger.js";

export default function healthCheck(req: Request, res: Response){
    logger.info("Everything is working fine in api-gateway end !");
    res.status(200).json({msg:"OKAY ITS WORKING"})    
}