import express from "express";

import {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  logout,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/auth.controller";

import { authenticateUser } from "../middleware/auth.middleware";

const router = express.Router();

/**
 * Public Routes
 */

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Forgot Password
router.post("/forgot-password", forgotPasswordController);

// Reset Password
router.post("/reset-password", resetPasswordController);

/**
 * Protected Routes
 */

// Get Profile
router.get("/profile", authenticateUser(), getUserProfile);

// Update Profile
router.put("/profile", authenticateUser(), updateUserProfile);

// Change Password
router.put("/change-password", authenticateUser(), changeUserPassword);

// Logout
router.post("/logout", authenticateUser(), logout);

export default router;
