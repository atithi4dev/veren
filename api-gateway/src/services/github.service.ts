import { Octokit } from "@octokit/rest";
import crypto from "crypto";
import { Project } from "@veren/domain";

export async function registerGithubWebhook(repoUrl: string, accessToken: string, projectId: string) {
    const repoFullName = new URL(repoUrl).pathname.slice(1); 
    const [owner, repo] = repoFullName.split("/");

    const octokit = new Octokit({ auth: accessToken });
    const webhookSecret = crypto.randomBytes(32).toString("hex");

    const { data: hook } = await octokit.repos.createWebhook({
        owner,
        repo,
        config: {
            url: process.env.WEBHOOK_URL, 
            content_type: "json",
            secret: webhookSecret,
        },
        events: ["push"],
        active: true,
    });

    await Project.findByIdAndUpdate(projectId, {
        githubWebhookId: hook.id,
        githubWebhookSecret: webhookSecret,
    });
}