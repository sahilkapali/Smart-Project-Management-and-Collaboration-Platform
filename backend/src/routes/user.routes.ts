import express from "express";

import {
  getUsers,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  updateUserRoleController,
} from "../controllers/user.controller";

import { authenticateUser } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { ROLE } from "../types/enum.types";
import { authorizeRoles } from "../middleware/rbac.middleware";

const router = express.Router();

// =====================================================
// Get all users
// =====================================================
// Used by Meeting Participant Selector
//
// Any authenticated user can access this endpoint.

router.get("/", authenticateUser(), getUsers);

// =====================================================
// Get logged-in user's profile
// =====================================================

router.get("/profile", authenticateUser(), getUserProfile);

// =====================================================
// Update logged-in user's profile
// =====================================================

router.put("/profile", authenticateUser(), updateUserProfile);

// =====================================================
// Change password
// =====================================================

router.put(
  "/change-password",
  authenticateUser(),
  validate([
    {
      field: "currentPassword",
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

// =====================================================
// Update User Role
// =====================================================
//
// PATCH /api/users/:userId/role
//
// ADMIN ONLY
//
// Request:
//
// {
//   "role": "PROJECT_MANAGER"
// }
//
// Allowed:
//
// ADMIN
// PROJECT_MANAGER
// TEAM_MEMBER
//
// =====================================================

router.patch(
  "/:userId/role",
  authenticateUser(),
  authorizeRoles(ROLE.ADMIN),
  updateUserRoleController,
);

export default router;
