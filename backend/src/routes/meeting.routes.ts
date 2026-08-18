import { Router } from "express";

import {
  createMeeting,
  updateMeeting,
  getProjectMeetings,
  getMeetingById,
  deleteMeeting,
  autoSummarizeMeeting,
  extractMeetingActionItems,
  addMeetingNotes,
  updateMeetingNotes,
  patchMeetingNotes,
} from "../controllers/meeting.controller";

import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

// =====================================================
// CREATE
// =====================================================

router.post(
  "/",
  authenticateUser(),
  createMeeting,
);

// =====================================================
// PROJECT MEETINGS
// IMPORTANT: KEEP THIS BEFORE /:id
// =====================================================

router.get(
  "/project/:projectId",
  authenticateUser(),
  getProjectMeetings,
);

// =====================================================
// MEETING NOTES
// IMPORTANT: KEEP THESE BEFORE GENERIC /:id
// =====================================================

router.post(
  "/:id/notes",
  authenticateUser(),
  addMeetingNotes,
);

router.put(
  "/:id/notes",
  authenticateUser(),
  updateMeetingNotes,
);

router.patch(
  "/:id/notes",
  authenticateUser(),
  patchMeetingNotes,
);

// =====================================================
// AI
// =====================================================

router.patch(
  "/:id/ai-summary",
  authenticateUser(),
  autoSummarizeMeeting,
);

router.patch(
  "/:id/action-items",
  authenticateUser(),
  extractMeetingActionItems,
);

// =====================================================
// UPDATE
// =====================================================

router.put(
  "/:id",
  authenticateUser(),
  updateMeeting,
);

// =====================================================
// GET ONE
// =====================================================

router.get(
  "/:id",
  authenticateUser(),
  getMeetingById,
);

// =====================================================
// DELETE
// =====================================================

router.delete(
  "/:id",
  authenticateUser(),
  deleteMeeting,
);

export default router;