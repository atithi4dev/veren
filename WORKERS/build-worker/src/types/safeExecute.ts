import logger from "../logger/logger.js";

export async function safeExecute<T>(fn: ()=> Promise<T>, fallback: T) {
     try {
        return await fn();
    } catch (err) {
        logger.error("Caught error in safeExecute:", err);
        return fallback;
    }
}