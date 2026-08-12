import { Router } from "express";

import {
  createMeeting,
  updateMeeting,
  getProjectMeetings,
  getMeetingById,
  deleteMeeting,
  autoSummarizeMeeting,
  extractMeetingActionItems,
} from "../controllers/meeting.controller";

import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticateUser(),
  createMeeting
);

router.put(
  "/:id",
  authenticateUser(),
  updateMeeting
);

router.get(
  "/project/:projectId",
  authenticateUser(),
  getProjectMeetings
);

router.get(
  "/:id",
  authenticateUser(),
  getMeetingById
);

router.delete(
  "/:id",
  authenticateUser(),
  deleteMeeting
);

router.patch(
  "/:id/ai-summary",
  authenticateUser(),
  autoSummarizeMeeting
);

router.patch(
  "/:id/action-items",
  authenticateUser(),
  extractMeetingActionItems
);

export default router;