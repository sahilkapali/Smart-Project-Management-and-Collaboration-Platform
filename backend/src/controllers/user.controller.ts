import { Request, Response, NextFunction } from "express";
import User from "../models/user.models";

import {
  getProfile,
  updateProfile,
  changePassword,
} from "../services/auth.service";

// Get all users
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await User.find()
      .select("_id firstName lastName email role")
      .sort({ firstName: 1 });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Get logged-in user's profile
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
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

// Update logged-in user's profile
export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const { firstName, lastName, phone } = req.body;

    if (!firstName && !lastName && !phone) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update profile",
      });
    }

    const result = await updateProfile(userId, {
      firstName,
      lastName,
      phone,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Change user password
export const changeUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "oldPassword and newPassword are required",
      });
    }

    const result = await changePassword(
      userId,
      oldPassword,
      newPassword,
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};