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
import { validate } from "../middleware/validation.middleware";

const router = express.Router();


const isValidEmail = (email: any): boolean => {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateRegister = (body: any): string[] => {
  const errors: string[] = [];
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    errors.push("Name is required and must be at least 2 characters long");
  }
  if (!isValidEmail(body.email)) {
    errors.push("A valid email is required");
  }
  if (!body.password || typeof body.password !== 'string' || body.password.length < 6) {
    errors.push("Password is required and must be at least 6 characters long");
  }
  return errors;
};

const validateLogin = (body: any): string[] => {
  const errors: string[] = [];
  if (!isValidEmail(body.email)) {
    errors.push("A valid email is required");
  }
  if (!body.password || typeof body.password !== 'string') {
    errors.push("Password is required");
  }
  return errors;
};

const validatePasswordChange = (body: any): string[] => {
  const errors: string[] = [];
  if (!body.oldPassword || typeof body.oldPassword !== 'string') {
    errors.push("Current password is required");
  }
  if (!body.newPassword || typeof body.newPassword !== 'string' || body.newPassword.length < 6) {
    errors.push("New password is required and must be at least 6 characters long");
  }
  return errors;
};


router.post("/register", validate(validateRegister), register);


router.post("/login", validate(validateLogin), login);


router.get("/profile", authenticateUser(), getUserProfile);

router.put("/profile", authenticateUser(), updateUserProfile);

router.put(
  "/change-password",
  authenticateUser(),
  validate(validatePasswordChange),
  changeUserPassword
);

router.post("/logout", authenticateUser(), logout);

export default router;