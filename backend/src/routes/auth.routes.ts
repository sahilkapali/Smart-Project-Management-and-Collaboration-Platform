import express from "express";
import { register, login, logout } from "../controllers/auth.controller";
import { validate } from "../middleware/validation.middleware";
import { authenticateUser } from "../middleware/auth.middleware";

const router = express.Router();

const isValidEmail = (email: any): boolean => {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateRegister = (body: any): string[] => {
  const errors: string[] = [];
  if (!body.firstName || typeof body.firstName !== 'string' || body.firstName.trim().length < 2) errors.push("First name is required");
  if (!body.lastName || typeof body.lastName !== 'string' || body.lastName.trim().length < 2) errors.push("Last name is required");
  if (!isValidEmail(body.email)) errors.push("A valid email is required");
  if (!body.password || typeof body.password !== 'string' || body.password.length < 6) errors.push("Password must be at least 6 characters");
  return errors;
};

const validateLogin = (body: any): string[] => {
  const errors: string[] = [];
  if (!isValidEmail(body.email)) errors.push("A valid email is required");
  if (!body.password) errors.push("Password is required");
  return errors;
};


router.post("/register", validate(validateRegister), register);
router.post("/login", validate(validateLogin), login);


router.post("/logout", authenticateUser(), logout);

export default router;