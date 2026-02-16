import { Types } from "mongoose";

interface Env {
    key: string,
    value: string
}

interface RuntimeConfig {
  rType: "static" | "server";
  port?: number;
}

export interface IProject {
    _id?: Types.ObjectId;

    name: string,

    git: {
        provider: "github";
        repoUrl: string;
        branch: string;
        rootDir?: string;
    }
    envs: {
        frontendEnv: Env[],
        backendEnv: Env[]
    },
    repoPath: {
        frontendDirPath: string;
        backendDirPath: string;
    },
    domains: {
        subdomain: string;
        customDomain?: string;
    }
    build: {
        framework?: string;
        frontendBuildCommand?: string;
        frontendInstallCommand?: string;
        backendInstallCommand?: string;
        frontendOutDir: string;
        backendStartCommand: string

    },
    runtime: {
        frontend: RuntimeConfig;
        backend: RuntimeConfig;
    };
    status: "active" | "paused" | "deleted"
    deployments: Types.ObjectId[];
    currentDeployment: Types.ObjectId;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

