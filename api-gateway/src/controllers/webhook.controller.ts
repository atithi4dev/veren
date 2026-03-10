// controllers/webhook.controller.ts
import { Request, Response } from "express";
import { Webhooks } from "@octokit/webhooks";
import { Project, User } from "@veren/domain";
import { triggerDeploy } from "../services/deploy.service.js";
import asyncHandler from "../utils/api-utils/asyncHandler.js";
import logger from "../logger/logger.js";

export const githubWebhookController = asyncHandler(async (req: Request, res: Response) => {
    const event = req.headers['x-github-event'];

    // GitHub sends ping when webhook is first registered
    if (event === 'ping') return res.sendStatus(200);

    try {
        const body = JSON.parse(req.body);
        const repoUrl = body.repository.html_url;

        const project = await Project.findOne({ "git.repoUrl": repoUrl });

        if (!project) return res.sendStatus(404);

        const projectWebhooks = new Webhooks({ secret: project.githubWebhookSecret });
        const isValid = await projectWebhooks.verify(
            req.body.toString(),
            req.headers["x-hub-signature-256"] as string
        );

        if (!isValid) return res.sendStatus(401);

        res.sendStatus(200); // ACK github

        const branch = body.ref.replace("refs/heads/", "");
        if (branch !== project.git.branch) return;

        const user = await User.findById(project.createdBy).select("+githubAccessToken");
        if (!user?.githubAccessToken) return;

        await triggerDeploy(project._id.toString(), user._id.toString(), user.githubAccessToken);
    } catch (error) {
        logger.error("WEBHOOK ERROR : ", error);
        throw error;
    }
});