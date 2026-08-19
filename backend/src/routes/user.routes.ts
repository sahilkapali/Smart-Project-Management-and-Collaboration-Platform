import express from "express";

import {
  getUsers,
  getUserProfile,
  updateUserProfile,
  updateUserProfileImage,
  changeUserPassword,
  updateUserRoleController,
} from "../controllers/user.controller";

import { authenticateUser } from "../middleware/auth.middleware";

import { validate } from "../middleware/validation.middleware";

import { ROLE } from "../types/enum.types";

import { authorizeRoles } from "../middleware/rbac.middleware";

import profileImageUpload from "../middleware/profileImageUpload.middleware";

const router = express.Router();

// =====================================================
// Get all users
// =====================================================
//
// GET /api/users
//
// Any authenticated user can access this endpoint.
//

router.get("/", authenticateUser(), getUsers);

// =====================================================
// Get logged-in user's profile
// =====================================================
//
// GET /api/users/profile
//

router.get("/profile", authenticateUser(), getUserProfile);

// =====================================================
// Update logged-in user's profile
// =====================================================
//
// PUT /api/users/profile
//

router.put("/profile", authenticateUser(), updateUserProfile);

// =====================================================
// Upload / Update Profile Image
// =====================================================
//
// POST /api/users/profile/image
//
// Request:
//
// multipart/form-data
//
// Field name:
// image
//
// Authentication:
// Required
//
// =====================================================

router.post(
  "/profile/image",
  authenticateUser(),
  profileImageUpload.single("image"),
  updateUserProfileImage,
);

// =====================================================
// Change password
// =====================================================
//
// PUT /api/users/change-password
//

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
