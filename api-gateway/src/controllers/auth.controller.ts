import { Request, Response } from "express";
import crypto from "crypto";
import fetch from "node-fetch";

// LOGIN CONTROLLER

export async function LoginController(req: Request, res: Response) {
    const state = crypto.randomBytes(16).toString("hex");
    req.session.oauthState = state;

    const clientId = process.env.GITHUB_CLIENT_ID;

    if (!clientId) {
        return res.status(500).json({ success: false, message: "GitHub Client ID not configured" });
    }

    const redirectUri = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&state=${state}`;
    res.redirect(redirectUri);
}

// CALLBACK CONTROLLER FOR GETTING GITHUB AUTH TOKEN

export async function CallbackController (req: Request, res: Response){
    if (req.query.state !== req.session.oauthState) {
        return res.status(400).json({ error: "Invalid state" });
    }

    const code = req.query.code as string | undefined;

    if (!code) {
        return res.status(400).json({ success: false, message: "Code not provided" });
    }

    const client_id = process.env.GITHUB_CLIENT_ID;
    const client_secret = process.env.GITHUB_CLIENT_SECRET;

    if (!client_id || !client_secret) {
        return res.status(500).json({ success: false, message: "Missing Github Credentials" });
    }

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

        if(!tokenResp.ok) throw new Error(`Github responded with ${tokenResp.status}`);

        const tokenJson = (await tokenResp.json()) as { access_token?: string };
        if (!tokenJson.access_token) {
            return res.status(400).json({ success: false, message: "Failed to get access token" });
        }

        req.session.githubToken = tokenJson.access_token;
        res.redirect(`${process.env.FRONTEND_URL}/profile`);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: "Github OAuth Error" });
    }
}
