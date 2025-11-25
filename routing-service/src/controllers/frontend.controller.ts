import { Request,Response } from "express";

export default function healthCheck(req:Request, res:Response){
    const id = req.hostname.split(".")[0];
    const url = getS3Url(id);
    res.redirect(url);
}

function getS3Url(key: string) {
  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/__outputs/${key}/index.html`;
}
