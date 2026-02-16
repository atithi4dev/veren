import { Types } from "mongoose";

export interface IDeployment {
    _id: Types.ObjectId;

    projectId: Types.ObjectId;
    owner: Types.ObjectId,
    status: "queued" | "building" | "deployed" | "failed";
    number: number;
    commitHash: string;
    commitMessage?: string;
    buildLogsUrl?: string;
    frontendTaskArn: string;
    backendTaskArn: string;
    backendImageUrl: string;
    backendECSContainerArn: string;
    artifactUrl?: string;
    error?: IError; 
    rollBackArtifactUrl?: string
    startedAt: Date;
    finishedAt?: Date;
}

interface IError {
    type: string;
    message: string;
}