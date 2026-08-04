import { Request, Response, NextFunction } from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../services/auth.service";

/**
 * Get Logged-in User Profile
 */
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User not found.",
      });
    }

    const result = await getProfile(userId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Update User Profile
 */
export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User not found.",
      });
    }

    const { first_Name, last_Name, phone } = req.body;

    if (!first_Name && !last_Name && !phone) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update profile",
      });
    }

    const result = await updateProfile(userId, {
      first_Name,
      last_Name,
      phone,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Change Password
 */
export const changeUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User not found.",
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "currentPassword and newPassword are required",
      });
    }

    const result = await changePassword(
      userId,
      currentPassword,
      newPassword
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};