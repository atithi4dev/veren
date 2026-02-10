import { Request, Response } from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import ApiError from "../utils/api-utils/ApiError.js";

import githubAuthService from "../services/githubAuth.service.js";
import setAuthCookies from "../utils/auth/authCookies.js";
import asyncHandler from "../utils/api-utils/asyncHandler.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/api-utils/ApiResponse.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import jwt from "jsonwebtoken";
import logger from "../logger/logger.js";

// LOGIN CONTROLLER
const LoginController = asyncHandler(async (req: Request, res: Response) => {
    const state = crypto.randomBytes(16).toString("hex");
    req.session.oauthState = state;

    const clientId = process.env.GITHUB_CLIENT_ID;

    if (!clientId) {
        throw new ApiError(500, "GitHub Client ID not configured");
    }

    const redirectUri = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo user:email read:user&state=${state}`;
    return res.redirect(redirectUri);
})

// CALLBACK CONTROLLER FOR GETTING GITHUB AUTH TOKEN
const CallbackController = asyncHandler(async (req: Request, res: Response) => {
    if (req.query.state !== req.session.oauthState) {
        throw new ApiError(400, "Invalid state")
    }

    const code = req.query.code as string | undefined;

    if (!code) {
        throw new ApiError(400, "Code not provided");
    }

    const client_id = process.env.GITHUB_CLIENT_ID;
    const client_secret = process.env.GITHUB_CLIENT_SECRET;

    if (!client_id || !client_secret) {
        throw new ApiError(500, "Missing Github Credentials");
    }
    let githubToken: string;
    try {
        const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                client_id,
                client_secret,
                code
            })
        });

        if (!tokenResp.ok) throw new ApiError(502, `GitHub OAuth failed (${tokenResp.status})`);

        const tokenJson = (await tokenResp.json()) as { access_token?: string };
        if (!tokenJson.access_token) {
            throw new ApiError(404, "Failed to get access token");
        }

        githubToken = tokenJson.access_token;

    } catch (err: any) {
        if (err instanceof ApiError) throw err;
        logger.error("GitHub OAuth Error", { error: err });
        throw new ApiError(500, "GitHub OAuth Error");
    }

    const { accessToken, refreshToken } = await githubAuthService(req, githubToken);

    setAuthCookies(res, accessToken, refreshToken);

    req.session.githubToken = githubToken;

    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
})

// LOGOUT 
const logOutController = asyncHandler(async (req: Request, res: Response) => {
    // if user is logged in, increment tokenVersion to invalidate old refresh tokens
    if (req.session.githubToken) {
        const githubId = req.session.githubId;

        const user = await User.findOne({ githubId: githubId });

        if (user) {
            user.tokenVersion = (user.tokenVersion ?? 0) + 1;
            await user.save();
        }
    }

    // Destroy session
    req.session.destroy((err: any) => {
        if (err) {
            logger.error("Error while destroying session: ", { error: err });
        }
    });

    // Clear JWT cookies
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")

    return res.status(200).json(new ApiResponse(200, {}, "Logged Out"));
})

const getMe = asyncHandler(async (req: Request, res: Response) => {

    if (!req.user) {
        return res.status(401).json(
            new ApiResponse(401, null, "Not authenticated")
        );
    }
    let user = await User.findById(req.user.id).select(
        "name userName email avatar provider createdAt"
    );;
    
    if (!user) {
        return res.status(404).json(
            new ApiResponse(404, null, "User not found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Fetched user successfully")
    );
});

const refreshAccessToken = asyncHandler(async (req:Request, res: Response)=>{
    let incomingRefreshToken =req.cookies.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401, "Refresh Token is required");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET!
        ) as {tokenVersion: number, sub: string};

        const user = await User.findById(decodedToken?.sub);
        if(!user){
            throw new ApiError(404, "Invalid refresh Token");
        }

        if(decodedToken?.tokenVersion! != user?.tokenVersion){
            throw new ApiError(404, "Invalid Refresh Token");
        }

        const options = {

        }
        const newRefreshToken = user.generateRefreshToken();
        const newAccessToken = user.generateAccessToken();

        setAuthCookies(res, newAccessToken, newRefreshToken);
        res.status(200).json(new ApiResponse(200, {newAccessToken, newRefreshToken}, "Refresh token generated successfully"));
    } catch (error) {
        throw new ApiError(404, "Failed to refresh refresh-token");
    }
})

export { LoginController, refreshAccessToken, CallbackController, logOutController, getMe }