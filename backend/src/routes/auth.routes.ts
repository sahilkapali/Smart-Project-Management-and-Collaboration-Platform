import express from "express";

import {
  register,
  login,
  logout,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/auth.controller";

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Forgot Password - Send OTP
router.post("/forgot-password", forgotPasswordController);

// Reset Password - Verify OTP + Change Password
router.post("/reset-password", resetPasswordController);

// Logout
router.post("/logout", logout);

export default router;
