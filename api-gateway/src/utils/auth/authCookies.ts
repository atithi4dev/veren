import { Response } from "express";

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export default function setAuthCookies(res:Response, accessToken:string, refreshToken:string){
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    sameSite: "lax",
    maxAge: ONE_WEEK, 
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ONE_WEEK,
  });
    
  return res
}