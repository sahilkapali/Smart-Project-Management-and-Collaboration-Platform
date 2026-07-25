import { Request, Response, NextFunction } from "express";

import User from "../models/user.models";
import AppError from "../utils/AppError.utils";

import { verifyToken } from "../utils/generateToken.utils";
import { ROLE } from "../types/enum.types";
import { ERROR_CODES } from "../types/error.types";

/**
 * Authentication Middleware
 */
export const authenticateUser = (roles?: ROLE[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError(
          "Access denied. No token provided.",
          ERROR_CODES.UNAUTHORIZED,
          401
        );
      }

    
      const token = authHeader.split(" ")[1];

      
      const decoded = verifyToken(token);

      
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new AppError(
          "User not found.",
          ERROR_CODES.NOT_FOUND,
          404
        );
      }

     
      if (
        roles &&
        roles.length > 0 &&
        !roles.includes(user.role)
      ) {
        throw new AppError(
          "Access forbidden.",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }

      
      (req as any).user = {
        id: user._id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};