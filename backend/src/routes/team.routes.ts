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

router.post(
  "/",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  handleCreateTeam,
);

router.get("/", authenticateUser(), handleGetTeams);

router.get("/:teamId", authenticateUser(), handleGetTeamById);

router.post(
  "/:teamId/members",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  handleAddTeamMember,
);

router.delete(
  "/:teamId/members/:userId",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  handleRemoveTeamMember,
);

router.put(
  "/:teamId",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  handleUpdateTeam,
);

router.delete(
  "/:teamId",
  authenticateUser([ROLE.ADMIN, ROLE.PROJECT_MANAGER]),
  handleDeleteTeam,
);

export default router;
