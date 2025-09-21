import { Request, Response } from "express";

export default function healthCheck(req: Request, res: Response){
    console.log("Everything is working fine in api-gateway end !");
    res.status(200).json({msg:"OKAY ITS WORKING"})    
}