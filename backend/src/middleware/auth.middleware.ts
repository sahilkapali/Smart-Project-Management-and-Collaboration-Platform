import { Request, Response, NextFunction } from "express";

import User from "../models/user.models";
import AppError from "../utils/AppError.utils";

import { verifyToken } from "../utils/generateToken.utils";
import { ROLE } from "../types/enum.types";
import { ERROR_CODES } from "../types/error.types";

/**
 * Authentication + Role Authorization Middleware
 *
 * Usage:
 *
 * authenticateUser()
 *     → Any authenticated user
 *
 * authenticateUser([ROLE.ADMIN])
 *     → Admin only
 *
 * authenticateUser([
 *   ROLE.ADMIN,
 *   ROLE.PROJECT_MANAGER,
 * ])
 *     → Admin OR Team Lead
 */
export const authenticateUser = (roles?: ROLE[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // ==========================================
      // 1. Read Authorization Header
      // ==========================================

      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new AppError(
          "Access denied. No authorization token provided.",
          ERROR_CODES.UNAUTHORIZED,
          401,
        );
      }

      // ==========================================
      // 2. Validate Bearer Format
      // ==========================================

      if (!authHeader.startsWith("Bearer ")) {
        throw new AppError(
          "Invalid authorization format. Use Bearer <token>.",
          ERROR_CODES.UNAUTHORIZED,
          401,
        );
      }

      // ==========================================
      // 3. Extract JWT
      // ==========================================

      const token = authHeader.substring(7).trim();

      if (!token) {
        throw new AppError(
          "Access denied. No token provided.",
          ERROR_CODES.UNAUTHORIZED,
          401,
        );
      }

      // ==========================================
      // 4. Verify JWT
      // ==========================================

      const decoded = verifyToken(token);

      if (!decoded?.id) {
        throw new AppError(
          "Invalid authentication token.",
          ERROR_CODES.UNAUTHORIZED,
          401,
        );
      }

      // ==========================================
      // 5. Get CURRENT User From Database
      // ==========================================
      //
      // IMPORTANT:
      // We intentionally do NOT trust the role
      // stored inside the JWT.
      //
      // The database is the source of truth for
      // the user's current role and account status.
      // ==========================================

      const user = await User.findById(decoded.id);

      if (!user) {
        throw new AppError("User not found.", ERROR_CODES.NOT_FOUND, 404);
      }

      // ==========================================
      // 6. Check Account Status
      // ==========================================

      if (user.active === false) {
        throw new AppError(
          "Your account has been deactivated.",
          ERROR_CODES.FORBIDDEN,
          403,
        );
      }

      // ==========================================
      // 7. Validate Stored Role
      // ==========================================

      const currentRole = user.role as ROLE;

      if (!Object.values(ROLE).includes(currentRole)) {
        throw new AppError(
          "Invalid user role configuration.",
          ERROR_CODES.FORBIDDEN,
          403,
        );
      }

      // ==========================================
      // 8. Role Authorization
      // ==========================================
      //
      // If roles were supplied, the current user
      // must have one of those roles.
      // ==========================================

      if (roles && roles.length > 0 && !roles.includes(currentRole)) {
        throw new AppError(
          "Access forbidden. You do not have permission to perform this action.",
          ERROR_CODES.FORBIDDEN,
          403,
        );
      }

      // ==========================================
      // 9. Attach Authenticated User To Request
      // ==========================================

      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: currentRole,
      };

      // ==========================================
      // 10. Continue Request
      // ==========================================

      next();
    } catch (error) {
      next(error);
    }
  };
};
