import { Request, Response, NextFunction, RequestHandler } from "express";

import User from "../models/user.models";
import AppError from "../utils/AppError.utils";

import { verifyToken } from "../utils/generateToken.utils";
import { ROLE } from "../types/enum.types";
import { ERROR_CODES } from "../types/error.types";

// ==========================================
// FUNCTION OVERLOADS FOR TYPESCRIPT
// ==========================================

// 1. Direct middleware usage: router.use(authenticateUser)
export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void>;

// 2. Factory usage: router.use(authenticateUser()) or router.use(authenticateUser([ROLE.ADMIN]))
export function authenticateUser(roles?: ROLE[]): RequestHandler;

// ==========================================
// IMPLEMENTATION
// ==========================================

export function authenticateUser(
  rolesOrReq?: ROLE[] | Request,
  res?: Response,
  next?: NextFunction,
): RequestHandler | Promise<void> {
  // Direct Express middleware usage: router.use(authenticateUser)
  if (rolesOrReq && "headers" in rolesOrReq && res && next) {
    return runAuth(rolesOrReq as Request, res, next);
  }

  // Factory usage: router.use(authenticateUser()) or router.use(authenticateUser([ROLE.ADMIN]))
  const roles = rolesOrReq as ROLE[] | undefined;
  return (req: Request, res: Response, next: NextFunction): void => {
    runAuth(req, res, next, roles);
  };
}

// Internal Authentication Logic
const runAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
  roles?: ROLE[],
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(
        "Access denied. No authorization token provided.",
        ERROR_CODES.UNAUTHORIZED,
        401,
      );
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new AppError(
        "Invalid authorization format. Use Bearer <token>.",
        ERROR_CODES.UNAUTHORIZED,
        401,
      );
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      throw new AppError(
        "Access denied. No token provided.",
        ERROR_CODES.UNAUTHORIZED,
        401,
      );
    }

    const decoded = verifyToken(token);

    if (!decoded?.id) {
      throw new AppError(
        "Invalid authentication token.",
        ERROR_CODES.UNAUTHORIZED,
        401,
      );
    }

    const user = await User.findById(decoded.id).exec();

    if (!user) {
      throw new AppError("User not found.", ERROR_CODES.NOT_FOUND, 404);
    }

    if (user.active === false) {
      throw new AppError(
        "Your account has been deactivated.",
        ERROR_CODES.FORBIDDEN,
        403,
      );
    }

    const currentRole = user.role as ROLE;

    if (!Object.values(ROLE).includes(currentRole)) {
      throw new AppError(
        "Invalid user role configuration.",
        ERROR_CODES.FORBIDDEN,
        403,
      );
    }

    if (roles && roles.length > 0 && !roles.includes(currentRole)) {
      throw new AppError(
        "Access forbidden. You do not have permission to perform this action.",
        ERROR_CODES.FORBIDDEN,
        403,
      );
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: currentRole,
    };

    next();
  } catch (error) {
    next(error);
  }
};