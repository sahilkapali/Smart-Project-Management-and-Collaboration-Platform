import { Router } from "express";

import {
  getProjectInsight,
  prioritizeTask,
  generateSummary,
  generateActionItems,
  getProjectAIOutputs,
  getTaskAIOutputs,
  getMeetingAIOutputs,
} from "../controllers/ai.controller";

import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

// =====================================================
// GENERAL PROJECT INSIGHT
// POST /api/ai/insight
// =====================================================

router.post("/insight", authenticateUser(), getProjectInsight);

// =====================================================
// TASK PRIORITIZATION
// POST /api/ai/task/:taskId/prioritize
// =====================================================

router.post("/task/:taskId/prioritize", authenticateUser(), prioritizeTask);

// =====================================================
// MEETING SUMMARY
// PATCH /api/ai/meeting/:meetingId/summary
// =====================================================

router.patch(
  "/meeting/:meetingId/summary",
  authenticateUser(),
  generateSummary,
);

// =====================================================
// MEETING ACTION ITEMS
// PATCH /api/ai/meeting/:meetingId/action-items
// =====================================================

router.patch(
  "/meeting/:meetingId/action-items",
  authenticateUser(),
  generateActionItems,
);

// =====================================================
// GET PROJECT AI HISTORY
// GET /api/ai/project/:projectId
// =====================================================

router.get("/project/:projectId", authenticateUser(), getProjectAIOutputs);

// =====================================================
// GET TASK AI HISTORY
// GET /api/ai/task/:taskId
// =====================================================

router.get("/task/:taskId", authenticateUser(), getTaskAIOutputs);

// =====================================================
// GET MEETING AI HISTORY
// GET /api/ai/meeting/:meetingId
// =====================================================

router.get("/meeting/:meetingId", authenticateUser(), getMeetingAIOutputs);

export default router;
