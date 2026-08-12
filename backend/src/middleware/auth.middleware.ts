import { Request, Response, NextFunction } from "express";

import User from "../models/user.models";
import AppError from "../utils/AppError.utils";

import { verifyToken } from "../utils/generateToken.utils";
import { ROLE } from "../types/enum.types";
import { ERROR_CODES } from "../types/error.types";

/**
 * ----------------------------------------------------
 * Authentication + Role Authorization Middleware
 * ----------------------------------------------------
 *
 * Usage:
 *
 * authenticateUser()
 *      → Any authenticated user
 *
 * authenticateUser([ROLE.ADMIN])
 *      → Admin only
 *
 * authenticateUser([
 *   ROLE.ADMIN,
 *   ROLE.PROJECT_MANAGER
 * ])
 *      → Admin OR Project Manager
 *
 */
export const authenticateUser = (roles?: ROLE[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      /**
       * ------------------------------------------------
       * 1. Get Authorization Header
       * ------------------------------------------------
       */

      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new AppError(
          "Access denied. No authorization token provided.",
          ERROR_CODES.UNAUTHORIZED,
          401
        );
      }

      /**
       * ------------------------------------------------
       * 2. Check Bearer Format
       * ------------------------------------------------
       */

      if (!authHeader.startsWith("Bearer ")) {
        throw new AppError(
          "Invalid authorization format. Use Bearer <token>.",
          ERROR_CODES.UNAUTHORIZED,
          401
        );
      }

      /**
       * ------------------------------------------------
       * 3. Extract Token
       * ------------------------------------------------
       */

      const token = authHeader.substring(7).trim();

      if (!token) {
        throw new AppError(
          "Access denied. No token provided.",
          ERROR_CODES.UNAUTHORIZED,
          401
        );
      }

      /**
       * ------------------------------------------------
       * 4. Verify JWT
       * ------------------------------------------------
       */

      const decoded = verifyToken(token);

      /**
       * ------------------------------------------------
       * 5. Find User
       * ------------------------------------------------
       */

      const user = await User.findById(decoded.id);

      if (!user) {
        throw new AppError(
          "User not found.",
          ERROR_CODES.NOT_FOUND,
          404
        );
      }

      /**
       * ------------------------------------------------
       * 6. Check Account Status
       * ------------------------------------------------
       *
       * Prevent deactivated users from accessing
       * protected resources.
       */

      if (user.active === false) {
        throw new AppError(
          "Your account has been deactivated.",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }

      /**
       * ------------------------------------------------
       * 7. Role-Based Authorization
       * ------------------------------------------------
       */

      if (
        roles &&
        roles.length > 0 &&
        !roles.includes(user.role as ROLE)
      ) {
        throw new AppError(
          "Access forbidden. You do not have permission to perform this action.",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }

      /**
       * ------------------------------------------------
       * 8. Attach Authenticated User to Request
       * ------------------------------------------------
       */

      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role as ROLE,
      };

      /**
       * ------------------------------------------------
       * 9. Continue
       * ------------------------------------------------
       */

      next();
    } catch (error) {
      next(error);
    }
  };
};
