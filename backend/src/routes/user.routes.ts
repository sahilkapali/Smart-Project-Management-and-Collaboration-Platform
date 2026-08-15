import express from "express";

import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "../controllers/user.controller";

import { authenticateUser } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";

const router = express.Router();

//User Profile

// Get logged-in user's profile
router.get("/profile", authenticateUser(), getUserProfile);

// Update logged-in user's profile
router.put("/profile", authenticateUser(), updateUserProfile);

//Change Password
router.put(
  "/change-password",
  authenticateUser(),
  validate([
    {
      field: "oldPassword",
      location: "body",
      required: true,
      minLength: 6,
    },
    {
      field: "newPassword",
      location: "body",
      required: true,
      minLength: 6,
    },
  ]),
  changeUserPassword,
);

export default router;
