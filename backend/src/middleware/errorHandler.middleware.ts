import { Request, Response, NextFunction } from "express";
import { ENV_CONFIG } from "../config/env";
import { ERROR_CODES } from "../types/error.types";

const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const message = error?.message || "Internal Server Error";
  const statusCode = error?.statusCode || 500;
  const code = error?.code || ERROR_CODES.INTERNAL_SERVER_ERROR;
  const status = error?.status || "error";

  console.error("========== ERROR ==========");
  console.error(error);

  const response: {
    success: boolean;
    status: string;
    code: string;
    message: string;
    data: null;
    stack?: string;
  } = {
    success: false,
    status,
    code,
    message,
    data: null,
  };

  
  if (ENV_CONFIG.node_env === "development") {
    response.stack = error?.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;