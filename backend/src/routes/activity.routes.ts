import { Router } from "express";

import {
  createActivity,
  getActivities,
  getProjectActivities,
  getActivityById,
  deleteActivity,
} from "../controllers/activity.controller";

import { verifyToken } from "../utils/generateToken.utils";

const router = Router();

// Create Activity
router.post("/", verifyToken, createActivity);

// Get All Activities
router.get("/", verifyToken, getActivities);

// Get Activities for a Project
router.get("/project/:projectId", verifyToken, getProjectActivities);

// Get Activity by ID
router.get("/:id", verifyToken, getActivityById);

// Delete Activity
router.delete("/:id", verifyToken, deleteActivity);

export default router;