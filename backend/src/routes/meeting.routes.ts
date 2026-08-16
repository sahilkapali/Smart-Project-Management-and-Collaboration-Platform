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

/**
 * Create meeting
 * POST /api/meetings
 */
router.post(
  "/",
  authenticateUser(),
  createMeeting,
);

/**
 * Update meeting
 * PUT /api/meetings/:id
 */
router.put(
  "/:id",
  authenticateUser(),
  updateMeeting,
);

/**
 * Get meetings for a project
 * GET /api/meetings/project/:projectId
 */
router.get(
  "/project/:projectId",
  authenticateUser(),
  getProjectMeetings,
);

/**
 * Get one meeting
 * GET /api/meetings/:id
 */
router.get(
  "/:id",
  authenticateUser(),
  getMeetingById,
);

/**
 * Delete meeting
 * DELETE /api/meetings/:id
 */
router.delete(
  "/:id",
  authenticateUser(),
  deleteMeeting,
);

/**
 * Add meeting note
 * POST /api/meetings/:id/notes
 */
router.post(
  "/:id/notes",
  authenticateUser(),
  addMeetingNotes,
);

/**
 * Update meeting note
 * PUT /api/meetings/:id/notes
 */
router.put(
  "/:id/notes",
  authenticateUser(),
  updateMeetingNotes,
);

/**
 * Patch meeting note
 * PATCH /api/meetings/:id/notes
 */
router.patch(
  "/:id/notes",
  authenticateUser(),
  patchMeetingNotes,
);

/**
 * Generate AI summary
 * PATCH /api/meetings/:id/ai-summary
 */
router.patch(
  "/:id/ai-summary",
  authenticateUser(),
  autoSummarizeMeeting,
);

/**
 * Extract action items
 * PATCH /api/meetings/:id/action-items
 */
router.patch(
  "/:id/action-items",
  authenticateUser(),
  extractMeetingActionItems,
);

export default router;