import { Schema, model } from 'mongoose'
import { IDeployment } from "./types/deployment.js"

const deploymentSchema = new Schema<IDeployment>({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["queued", "building", "deployed", "failed"],
        default: null
    },
    number: {
        type: Number,
        required: true
    },
    commitHash: {
        type: String,
        trim: true,
    },
    commitMessage: {
        type: String,
        trim: true
    },
    buildLogsUrl: {
        type: String
    },
    backendImageUrl: {
        type: String
    },
    backendECSContainerArn: {
        type: String
    },
    frontendTaskArn: {
        type: String
    },
    backendTaskArn: {
        type: String
    },
    artifactUrl: {
        type: String
    },
    rollBackArtifactUrl: {
        type: String
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    error: {
        type: {
            type: String
        },
        message: {
            type: String
        },
    },
    finishedAt: {
        type: Date,
        default: null
    },
},
    {
        timestamps: true
    }
)

deploymentSchema.index({ projectId: 1, number: -1 });
deploymentSchema.index({ projectId: 1, createdAt: -1 });

export const Deployment = model<IDeployment>("Deployment", deploymentSchema);
