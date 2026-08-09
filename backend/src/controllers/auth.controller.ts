import { Request, Response, NextFunction } from "express";

import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../services/auth.service";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await registerUser(req.body);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    const result = await getProfile(userId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    const result = await updateProfile(
      userId,
      req.body
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const changeUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    const {
      currentPassword,
      newPassword,
    } = req.body;

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


export const forgotPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const result = await forgotPassword({
      email,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required.",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required.",
      });
    }

    // Password length check
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters.",
      });
    }

    const result = await resetPassword({
      email,
      otp,
      newPassword,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};