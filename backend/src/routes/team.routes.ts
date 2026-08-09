import { Router } from "express";

import {
  handleCreateTeam,
  handleGetTeams,
  handleGetTeamById,
  handleAddTeamMember,
  handleRemoveTeamMember,
  handleUpdateTeam,
  handleDeleteTeam,
} from "../controllers/team.controller";

import { authenticateUser } from "../middleware/auth.middleware";
import { ROLE } from "../types/enum.types";

const router = Router();

/**
 * CREATE TEAM
 * Admin and Project Manager only
 */
router.post(
  "/",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  handleCreateTeam
);

/**
 * GET CURRENT USER TEAMS
 * Any authenticated user
 */
router.get(
  "/",
  authenticateUser(),
  handleGetTeams
);

/**
 * GET SINGLE TEAM
 * Any authenticated user
 */
router.get(
  "/:teamId",
  authenticateUser(),
  handleGetTeamById
);

/**
 * ADD MEMBER
 * Admin and Project Manager only
 */
router.post(
  "/:teamId/members",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  handleAddTeamMember
);

/**
 * REMOVE MEMBER
 * Admin and Project Manager only
 */
router.delete(
  "/:teamId/members/:userId",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  handleRemoveTeamMember
);

/**
 * UPDATE TEAM
 * Admin and Project Manager only
 */
router.put(
  "/:teamId",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  handleUpdateTeam
);

/**
 * DELETE TEAM
 * Admin and Project Manager only
 */
router.delete(
  "/:teamId",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  handleDeleteTeam
);

export default router;