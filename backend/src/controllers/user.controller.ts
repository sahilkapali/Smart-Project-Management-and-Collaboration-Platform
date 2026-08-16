import { Request, Response, NextFunction } from "express";
import { getProfile, updateProfile, changePassword } from "../services/auth.service";

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized. User not found." });
    
    const result = await getProfile(userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized." });

    // Changed to camelCase
    const { firstName, lastName, phone } = req.body;

    if (!firstName && !lastName && !phone) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update profile",
      });
    }

    const result = await updateProfile(userId, { firstName, lastName, phone });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const changeUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized." });

    // Changed currentPassword to oldPassword to match our validation middleware
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "oldPassword and newPassword are required",
      });
    }

    const result = await changePassword(userId, currentPassword, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};