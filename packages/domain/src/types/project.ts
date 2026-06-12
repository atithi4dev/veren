import { Types } from "mongoose";

interface Env {
    key: string,
    value: string
}
export type ProjectType = "frontend" | "backend";
interface RuntimeConfig {
    rType: "static" | "server";
    port?: number;
}

export interface IProject {

    _id?: Types.ObjectId;

    name: string,

    type: ProjectType,

    git: {
        provider: "github";
        repoUrl: string;
        branch: string;
        rootDir?: string;
    }

    envs: {
        type: Env[]
    }

    entryDirectory: string;
    domains: {
        subdomain: string;
        ip: string;
    }

    frontendBuild: {
        installCommand?: string;
        buildCommand?: string;
        outDir?: string;
        version: number
    },

    backendBuild: {
        installCommand?: string;
        runCommand?: string;
        version: number
    },

    githubWebhookId : string;
    githubWebhookSecret : string;
    runtime: RuntimeConfig;

    status: "active" | "paused" | "deleted"

    deployments: Types.ObjectId[];

    currentDeployment: Types.ObjectId;

    createdBy: Types.ObjectId;

    createdAt: Date;

    updatedAt: Date;
}

