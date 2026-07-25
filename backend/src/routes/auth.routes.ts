import express from "express";

import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "../controllers/user.controller"

import { authenticateUser } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";

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

router.put(
  "/change-password",
  authenticateUser(),
  validate(validatePasswordChange),
  changeUserPassword
);

export default router;