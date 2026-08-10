import { Router } from "express";

import {
  handleCreateProject,
  handleGetProjects,
  handleGetProjectById,
  handleUpdateProject,
  handleDeleteProject,
} from "../controllers/project.controller";

import { authenticateUser } from "../middleware/auth.middleware";

import { ROLE } from "../types/enum.types";

const router = Router();

/**
 * =========================================================
 * CREATE PROJECT
 * =========================================================
 *
 * ADMIN:
 * Can create project in any team.
 *
 * PROJECT_MANAGER:
 * Can create project in own team.
 *
 * TEAM_MEMBER:
 * Not allowed.
 */
router.post(
  "/",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  handleCreateProject,
);

/**
 * =========================================================
 * GET CURRENT USER PROJECTS
 * =========================================================
 *
 * ADMIN:
 * All projects.
 *
 * PROJECT_MANAGER:
 * Projects in their teams.
 *
 * TEAM_MEMBER:
 * Projects in teams they belong to.
 */
router.get("/", authenticateUser(), handleGetProjects);

/**
 * =========================================================
 * GET SINGLE PROJECT
 * =========================================================
 *
 * Any authenticated user who has access
 * to the project can view it.
 */
router.get("/:projectId", authenticateUser(), handleGetProjectById);

/**
 * =========================================================
 * UPDATE PROJECT
 * =========================================================
 *
 * ADMIN:
 * Any project.
 *
 * PROJECT_MANAGER:
 * Own team's project.
 *
 * TEAM_MEMBER:
 * Not allowed.
 */
router.put(
  "/:projectId",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  handleUpdateProject,
);

/**
 * =========================================================
 * DELETE PROJECT
 * =========================================================
 *
 * ADMIN:
 * Any project.
 *
 * PROJECT_MANAGER:
 * Own team's project.
 *
 * TEAM_MEMBER:
 * Not allowed.
 */
router.delete(
  "/:projectId",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  handleDeleteProject,
);

export default router;
