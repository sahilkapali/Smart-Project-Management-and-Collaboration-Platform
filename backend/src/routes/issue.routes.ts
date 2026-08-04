import { Router } from "express";
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} from "../controllers/issue.controller";

import { verifyToken } from "../utils/generateToken.utils";

const router = Router();

// Create Issue
router.post("/", verifyToken, createIssue);

// Get All Issues
router.get("/", verifyToken, getIssues);

// Get Issue By ID
router.get("/:id", verifyToken, getIssueById);

// Update Issue
router.put("/:id", verifyToken, updateIssue);

// Delete Issue
router.delete("/:id", verifyToken, deleteIssue);

export default router;