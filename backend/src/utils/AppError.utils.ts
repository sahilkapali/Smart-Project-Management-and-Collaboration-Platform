import { ERROR_CODES } from "../types/error.types";

class AppError extends Error {
  public readonly status: "error" | "fail";
  public readonly code: ERROR_CODES;
  public readonly statusCode: number;

  constructor(
    message: string,
    code: ERROR_CODES,
    statusCode: number
  ) {
    super(message);

    this.code = code;
    this.statusCode = statusCode;
    this.status =
      statusCode >= 400 && statusCode < 500
        ? "fail"
        : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;