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

// ==================== REGISTER ====================

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is required.",
      });
    }

    const result = await registerUser(req.body);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== LOGIN ====================

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("REQ BODY:", req.body);
    console.log("CONTENT TYPE:", req.headers["content-type"]);

    // Check whether request body exists
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is missing.",
      });
    }

    // Get login credentials
    const { email, password } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Validate password
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    // Explicitly pass the login data to the service
    const result = await loginUser({
      email,
      password,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== GET PROFILE ====================

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

// ==================== UPDATE PROFILE ====================

export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is required.",
      });
    }

    const result = await updateProfile(userId, req.body);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== CHANGE PASSWORD ====================

export const changeUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is required.",
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is required.",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required.",
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

// ==================== FORGOT PASSWORD ====================

export const forgotPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is required.",
      });
    }

    const { email } = req.body;

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

// ==================== RESET PASSWORD ====================

export const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is required.",
      });
    }

    const { email, otp, newPassword } = req.body;

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

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
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

// ==================== LOGOUT ====================

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