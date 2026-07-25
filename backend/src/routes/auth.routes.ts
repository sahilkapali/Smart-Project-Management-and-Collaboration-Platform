import express from "express";

import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "../controllers/user.controller"

import { authenticateUser } from "../middleware/auth.middleware";

const router = express.Router();

/**
 * ===============================
 * Protected User Routes
 * ===============================
 */

// Get Logged-in User Profile
router.get(
  "/profile",
  authenticateUser(),
  getUserProfile
);

// Update Profile
router.put(
  "/profile",
  authenticateUser(),
  updateUserProfile
);

// Change Password
router.put(
  "/change-password",
  authenticateUser(),
  changeUserPassword
);

export default router;