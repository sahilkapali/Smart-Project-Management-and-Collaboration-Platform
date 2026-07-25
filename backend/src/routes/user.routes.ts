import express from "express";

import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "../controllers/user.controller";

import { authenticateUser } from "../middleware/auth.middleware";

const router = express.Router();

/**
 * Get Logged-in User Profile
 * GET /api/users/profile
 */
router.get("/profile", authenticateUser(), getUserProfile);

/**
 * Update Logged-in User Profile
 * PUT /api/users/profile
 */
router.put("/profile", authenticateUser(), updateUserProfile);

/**
 * Change Password
 * PUT /api/users/change-password
 */
router.put("/change-password", authenticateUser(), changeUserPassword);

export default router;
