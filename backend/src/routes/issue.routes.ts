import { Router } from "express";
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  updateIssueStatus,
} from "../controllers/issue.controller";

import { verifyToken } from "../utils/generateToken.utils";

const router = Router();

// Issue CRUD
router.post("/", verifyToken, createIssue);
router.get("/", verifyToken, getIssues);
router.get("/:id", verifyToken, getIssueById);
router.put("/:id", verifyToken, updateIssue);
router.delete("/:id", verifyToken, deleteIssue);

// Update Issue Status
router.patch("/:id/status", verifyToken, updateIssueStatus);

export default router;