import { Router } from "express";

import {
  getActivities,
  getProjectActivities,
  getUserActivities,
  getActivityById,
  deleteActivity,
} from "../controllers/activity.controller";

import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

// =====================================================
// GET ALL ACTIVITIES
// GET /api/activities
// =====================================================

router.get("/", authenticateUser(), getActivities);

// =====================================================
// GET ACTIVITIES BY PROJECT
// GET /api/activities/project/:projectId
// =====================================================

router.get("/project/:projectId", authenticateUser(), getProjectActivities);

// =====================================================
// GET ACTIVITIES BY USER
// GET /api/activities/user/:userId
// =====================================================

router.get("/user/:userId", authenticateUser(), getUserActivities);

// =====================================================
// GET ACTIVITY BY ID
// GET /api/activities/:id
// =====================================================

router.get("/:id", authenticateUser(), getActivityById);

// =====================================================
// DELETE ACTIVITY
// DELETE /api/activities/:id
// =====================================================

router.delete("/:id", authenticateUser(), deleteActivity);

export default router;
