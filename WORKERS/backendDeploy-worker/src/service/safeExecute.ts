import { deploymentJobError } from "../utils/jobError";

export async function safeExecute<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        throw new deploymentJobError("Backend deployment failed", {
            msg: "Unex[ec"
        })
    }
}