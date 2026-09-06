import { Schema, model } from "mongoose";
import { IProject } from "../types/project.js";

const envSchema = new Schema(
    {
        key: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        }
    },
    { _id: false }
)

const projectSchema = new Schema<IProject>({

    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    type: {
        type: String,
        enum: ["frontend", "backend"],
        required: true
    },

    git: {
        provider: {
            type: String,
            enum: ["github"],
            default: "github"
        },
        repoUrl: {
            type: String,
            required: true
        },
        branch: {
            type: String,
            default: "main"
        },
        rootDir: {
            type: String,
            default: "./"
        },
    },

    envs: {
        type: [envSchema],
        default: []
    },
    entryDirectory: {
        type: String,
        default: "./"
    },

    domains: {
        subdomain: {
            type: String,
            unique: true,
        },
        ip: {
            type: String,
            unique: true
        }
    },

    frontendBuild: {
        framework: {
            type: String,
        },

        installCommand: {
            type: String,
            default: "npm install"
        },
        buildCommand: {
            type: String,
            default: "npm run build"
        },
        outDir: {
            type: String,
            default: "./build"
        },
        version: {
            type: Number,
            default: 20
        }
    },
    backendBuild: {
        installCommand: {
            type: String,
            default: "npm install"
        },
        runCommand: {
            type: String,
            default: "npm run build"
        },
        version: {
            type: Number,
            default: 20
        }
    },

    runtime: {
        rType: {
            type: String,
            enum: ["static", "server"],
            default: "server"

        },
        port: Number
    },

    status: {
        type: String,
        enum: ["active", "paused", "deleted"],
        default: "active",
    },
    githubWebhookId: {
        type: "String"
    },
    githubWebhookSecret: {
        type: "String"
    },
    deployments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Deployment"
        }
    ],
    currentDeployment: {
        type: Schema.Types.ObjectId,
        ref: "Deployment"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
},
    {
        timestamps: true
    }
)


envSchema.pre("save", function () {
    // encrypt value
});

export const Project = model<IProject>("Project", projectSchema);
