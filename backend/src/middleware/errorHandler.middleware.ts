import { Request, Response, NextFunction } from "express";
import { ENV_CONFIG } from "../config/env";
import { ERROR_CODES } from "../types/error.types";
import AppError from "../utils/AppError.utils";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const message =
    error?.message || "Internal Server Error";

  const statusCode =
    error?.statusCode || 500;

  const code =
    error?.code ||
    ERROR_CODES.INTERNAL_SERVER_ERROR;

  const status =
    error?.status || "error";

  console.error("========== ERROR ==========");
  console.error(error);

  return res.status(statusCode).json({
    success: false,
    status,
    code,
    message,
    data: null,
    stack:
      ENV_CONFIG.node_env === "development"
        ? error.stack
        : undefined,
  });
};

export default errorHandler;