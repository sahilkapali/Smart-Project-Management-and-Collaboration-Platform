import { Router } from "express";

import {
  createProject,
  handleAddProjectMember,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";

import { authenticateUser } from "../middleware/auth.middleware";

import { ROLE } from "../types/enum.types";

const router = Router();

// =====================================================
// CREATE PROJECT
// =====================================================
// ADMIN:
// Can create project in any team.
//
// PROJECT_MANAGER:
// Can create project in own team.
//
// TEAM_MEMBER:
// Not allowed.
// =====================================================

router.post(
  "/",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  createProject,
);

// =====================================================
// ADD MEMBER TO PROJECT
// =====================================================
//
// PROJECT_MANAGER:
// Can add members to projects belonging to their team.
//
// TEAM_MEMBER:
// Not allowed.
//
// Request body:
//
// {
//   "email": "member@example.com"
// }
//
// =====================================================

router.post(
  "/:projectId/members",
  authenticateUser([ROLE.PROJECT_MANAGER]),
  handleAddProjectMember,
);

// =====================================================
// GET CURRENT USER PROJECTS
// =====================================================
// ADMIN:
// All projects.
//
// PROJECT_MANAGER:
// Projects in their teams.
//
// TEAM_MEMBER:
// Projects in teams they belong to.
// =====================================================

router.get("/", authenticateUser(), getProjects);

// =====================================================
// GET SINGLE PROJECT
// =====================================================

router.get("/:projectId", authenticateUser(), getProjectById);

// =====================================================
// UPDATE PROJECT
// =====================================================
// ADMIN:
// Any project.
//
// PROJECT_MANAGER:
// Own team's project.
//
// TEAM_MEMBER:
// Not allowed.
// =====================================================

router.put(
  "/:projectId",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  updateProject,
);

// =====================================================
// DELETE PROJECT
// =====================================================
// ADMIN:
// Any project.
//
// PROJECT_MANAGER:
// Own team's project.
//
// TEAM_MEMBER:
// Not allowed.
// =====================================================

router.delete(
  "/:projectId",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  deleteProject,
);

export default router;
