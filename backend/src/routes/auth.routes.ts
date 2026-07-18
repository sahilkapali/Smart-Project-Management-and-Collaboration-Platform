import express from "express";

import {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  logout,
} from "../controllers/auth.controller";

import { authenticateUser } from "../middleware/auth.middleware";

const router = express.Router();

/**
 * Public Routes
 */

// Register User
router.post("/register", register);

// Login User
router.post("/login", login);

/**
 * Protected Routes
 */

// Get Logged-in User Profile
router.get("/profile", authenticateUser(), getUserProfile);

// Update Profile
router.put("/profile", authenticateUser(), updateUserProfile);

// Change Password
router.put(
  "/change-password",
  authenticateUser(),
  changeUserPassword
);

// Logout
router.post("/logout", authenticateUser(), logout);

export default router;