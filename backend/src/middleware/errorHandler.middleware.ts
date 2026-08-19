import { Request, Response, NextFunction } from "express";
import multer from "multer";

import { ENV_CONFIG } from "../config/env";
import { ERROR_CODES } from "../types/error.types";

const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error("========== ERROR ==========");
  console.error(error);

  // ============================================================
  // MULTER ERRORS
  // ============================================================

  if (error instanceof multer.MulterError) {
    let message = "File upload failed.";

    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        message = "Profile image must be less than 2 MB.";
        break;

      case "LIMIT_FILE_COUNT":
        message = "Only one profile image can be uploaded.";
        break;

      case "LIMIT_UNEXPECTED_FILE":
        if (error.field === "image") {
          message =
            "Invalid profile image format. Only JPG, JPEG, PNG and WEBP images are allowed.";
        } else {
          message = "Unexpected file field.";
        }
        break;

      default:
        message = error.message || "File upload failed.";
    }

    res.status(400).json({
      success: false,
      status: "fail",
      code: ERROR_CODES.BAD_REQUEST,
      message,
      data: null,
    });

    return;
  }

  // ============================================================
  // GENERAL ERROR
  // ============================================================

  const message = error?.message || "Internal Server Error";

  const statusCode =
    typeof error?.statusCode === "number" ? error.statusCode : 500;

  const code = error?.code || ERROR_CODES.INTERNAL_SERVER_ERROR;

  const status = error?.status || "error";

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

  // ============================================================
  // DEVELOPMENT STACK TRACE
  // ============================================================

  if (ENV_CONFIG.node_env === "development") {
    response.stack = error?.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
