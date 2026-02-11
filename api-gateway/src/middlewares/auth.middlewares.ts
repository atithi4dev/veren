import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utils/api-utils/ApiError.js";
import asyncHandler from "../utils/api-utils/asyncHandler.js";
import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: {
    id: string;
    provider: string;
  };
}

export const verifyJwt = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {

    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new ApiError(401, "No access token provided");
    }
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
    if (!ACCESS_TOKEN_SECRET) {
      throw new ApiError(500, "Access token secret not configured");
    }

    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as {
      sub: string;
      provider: string;
      type: string;
    };

    if (payload.type !== "access") {
      throw new ApiError(401, "Invalid token type");
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    req.user = {
      id: user._id.toString(),
      provider: user.provider,
    };

    next();
  }
);
