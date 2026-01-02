import { Types } from "mongoose";

interface IDeployment {
    _id: Types.ObjectId;

    projectId: Types.ObjectId;
    owner: Types.ObjectId,
    status: "queued" | "building" | "deployed" | "failed";
    number: number;
    commitHash: string;
    commitMessage?: string;
    buildLogsUrl?: string;
    artifactUrl?: string;
    rollBackArtifactUrl?: string
    startedAt: Date;
    finishedAt?: Date;
}

export default IDeployment