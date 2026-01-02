import { Schema, model } from "mongoose";
import IProject from "../types/project.js";

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
            default: "/"
        },
    },
    envs: {
        frontendEnv: {
            type: [envSchema],
            default: []
        },
        backendEnv: {
            type: [envSchema],
            default: [],
        }
    },
    repoPath: {
        frontendDirPath: {
            type: String,
            default: "./frontend"
        },
        backendDirPath: {
            type: String,
            default: "./backend"
        }
    },
    domains: {
        subdomain: {
            type: String,
            unique: true,
        },
        customDomain: {
            type: String,
        }
    },
    build: {
        framework: {
            type: String,
        },
        frontendBuildCommand: {
            type: String,
            default: "npm run build"
        },
        frontendInstallCommand: {
            type: String,
            default: "npm install"
        },
        backendInstallCommand: {
            type: String,
            default: "npm install"
        },
        frontendOutDir: {
            type: String,
            default: "./build"
        }
    },
    runtime: {
        frontend: {
            type: {
                type: String,
                enum: ["static", "server"],
                default: "static",
            },
            port: Number
        },
        backend: {
            type: {
                type: String,
                enum: ["static", "server"],
                default: "server"
            },
            port: Number
        }
    },
    status: {
        type: String,
        enum: ["active", "paused", "deleted"],
        default: "active",
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

const Project = model<IProject>("Project", projectSchema);

export default Project;