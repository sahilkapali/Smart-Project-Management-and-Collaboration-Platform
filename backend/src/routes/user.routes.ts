import express from "express";
import { getUserProfile, updateUserProfile, changeUserPassword } from "../controllers/user.controller";
import { authenticateUser } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";

const router = express.Router();

const validatePasswordChange = (body: any): string[] => {
  const errors: string[] = [];
  if (!body.oldPassword || typeof body.oldPassword !== 'string') errors.push("Current password is required");
  if (!body.newPassword || typeof body.newPassword !== 'string' || body.newPassword.length < 6) errors.push("New password is required and must be at least 6 characters long");
  return errors;
};


router.get("/profile", authenticateUser(), getUserProfile);
router.put("/profile", authenticateUser(), updateUserProfile);
router.put(
  "/change-password", 
  authenticateUser(), 
  validate(validatePasswordChange), 
  changeUserPassword
);

export default router;