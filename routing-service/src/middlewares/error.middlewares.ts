import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  let error: ApiError;

  if (err instanceof ApiError) {
    error = err;
  } else {  
    const statusCode = (err as any)?.statusCode ?? 500;
    const message = (err as any)?.message ?? "Internal Server Error";

    error = new ApiError(
      statusCode,
      message,
      (err as any)?.errors ?? [],
      (err as any)?.stack
    );
  }

  const response = {
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};

export { errorHandler };
