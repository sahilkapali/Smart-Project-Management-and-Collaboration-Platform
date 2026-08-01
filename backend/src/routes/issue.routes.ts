import { Router } from "express";
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} from "../controllers/issue.controller";

import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();


// Create Issue
router.post("/", authenticateUser(), createIssue);

// Get All Issues
router.get("/", authenticateUser(), getIssues);

// Get Issue By ID
router.get("/:id", authenticateUser(), getIssueById);

// Update Issue
router.put("/:id", authenticateUser(), updateIssue);

// Delete Issue
router.delete("/:id", authenticateUser(), deleteIssue);

export default router;