import { Request, Response, NextFunction } from "express";
import User from "../models/user.models";

import {
  getProfile,
  updateProfile,
  changePassword,
} from "../services/auth.service";

import { updateProfileImage } from "../services/profileImage.service";

import { updateUserRole } from "../services/user.service";
import { ROLE } from "../types/enum.types";

// ============================================
// Get all users
// ============================================

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

// ============================================
// Get logged-in user's profile
// ============================================

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

// ============================================
// Update logged-in user's profile
// ============================================

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

    // At least one field must be provided.
    //
    // Use === undefined instead of !value so that
    // validation does not incorrectly reject values
    // based only on truthiness.
    if (
      firstName === undefined &&
      lastName === undefined &&
      phone === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update profile.",
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

// ============================================
// Change user password
// ============================================

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
        message: "Unauthorized. User not found.",
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate request body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "currentPassword and newPassword are required.",
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    const result = await changePassword(userId, currentPassword, newPassword);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ============================================
// Update User Role
// ============================================
//
// PATCH /api/users/:userId/role
//
// ADMIN ONLY
//
// Request body:
//
// {
//   "role": "PROJECT_MANAGER"
// }
//
// Allowed roles:
//
// ADMIN
// PROJECT_MANAGER
// TEAM_MEMBER
//
// ============================================

export const updateUserRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // ------------------------------------------
    // Get user ID safely
    // ------------------------------------------
    //
    // Express can type req.params values as
    // string | string[] depending on the
    // TypeScript/Express version.
    //
    // We explicitly normalize it to a string.
    // ------------------------------------------

    const userIdParam = req.params.userId;

    if (!userIdParam) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // ------------------------------------------
    // Get requested role
    // ------------------------------------------

    const { role } = req.body;

    // ------------------------------------------
    // Validate role exists
    // ------------------------------------------

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required.",
      });
    }

    // ------------------------------------------
    // Validate role
    // ------------------------------------------

    if (!Object.values(ROLE).includes(role as ROLE)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Allowed roles are ADMIN, PROJECT_MANAGER, and TEAM_MEMBER.",
      });
    }

    // ------------------------------------------
    // Prevent Admin from removing own Admin role
    // ------------------------------------------

    if (req.user?.id === userId && role !== ROLE.ADMIN) {
      return res.status(400).json({
        success: false,
        message: "An administrator cannot remove their own admin role.",
      });
    }

    // ------------------------------------------
    // Update role
    // ------------------------------------------

    const result = await updateUserRole(userId, role as ROLE);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfileImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // ========================================================
    // GET AUTHENTICATED USER ID
    // ========================================================

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User not found.",
      });
    }

    // ========================================================
    // CHECK UPLOADED FILE
    // ========================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required.",
      });
    }

    // ========================================================
    // UPLOAD IMAGE TO CLOUDINARY
    // ========================================================

    await updateProfileImage(userId, req.file);

    // ========================================================
    // GET UPDATED USER
    // ========================================================
    //
    // We fetch the user again so the response contains the
    // complete updated User object expected by the frontend.
    //
    // ========================================================

    const updatedUser = await User.findById(userId);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ========================================================
    // RETURN UPDATED USER
    // ========================================================

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
