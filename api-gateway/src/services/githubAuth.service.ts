import {IUser, User} from "@veren/domain";
import ApiError from "../utils/api-utils/ApiError.js"
import {Request} from "express";

type AuthTokens = {
    accessToken: string,
    refreshToken: string
}
async function githubAuthService(req:Request, githubToken: string): Promise<AuthTokens> {
    const githubHeaders = {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
    }

    // Call GitHub /user
    const userResp = await fetch("https://api.github.com/user", {
        headers: githubHeaders
    })

    if (!userResp.ok) {
        throw new ApiError(502, "Failed to fetch github User")
    }

    const profile = await userResp.json();

    // Call GitHub /user/emails
    let userEmail = await fetch("https://api.github.com/user/emails", {
        headers: githubHeaders
    })

    if (!userEmail.ok) {
        throw new ApiError(502, "Failed to fetch github user emails.");
    }

    const emails = await userEmail.json();

    const githubId = profile.id.toString();

    let user = await User.findOne({ githubId });

    const primaryEmail = emails.find((e: any) => e.primary && e.verified)?.email;
    
    if (!user) {
        user = await User.create({
            githubId,
            provider: "github",
            name: profile.name ?? profile.login,
            email:  primaryEmail ?? profile.email ?? "",
            userName: profile.login,
            avatar: profile.avatar_url,
            githubAccessToken: githubToken
        });
    }else{
        user.name = profile.name ?? user.name;
        user.avatar = profile.avatar_url ?? user.avatar;
        user.email = primaryEmail ?? user.email;
        user.githubAccessToken = githubToken;
        user.tokenVersion = (user.tokenVersion ?? 0) + 1;

        await user.save();
    }
    req.session.githubId = githubId;
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    return { accessToken, refreshToken }
}

export default githubAuthService