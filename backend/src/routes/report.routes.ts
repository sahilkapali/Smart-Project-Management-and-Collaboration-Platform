import { Router } from "express";

import {
  getProjectReport,
  getTaskReport,
  getIssueReport,
} from "../controllers/report.controller";

import { verifyToken } from "../utils/generateToken.utils";

const router = Router();

// Complete Project Report
router.get(
  "/project/:projectId",
  verifyToken,
  getProjectReport
);

// Task Report
router.get(
  "/project/:projectId/tasks",
  verifyToken,
  getTaskReport
);

// Issue Report
router.get(
  "/project/:projectId/issues",
  verifyToken,
  getIssueReport
);

export default router;