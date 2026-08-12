import { Router } from "express";
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  addIssueComment,
  getIssueComments,
} from "../controllers/issue.controller";

import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

// CRUD
router.post("/", authenticateUser(), createIssue);
router.get("/", authenticateUser(), getIssues);
router.get("/:id", authenticateUser(), getIssueById);
router.put("/:id", authenticateUser(), updateIssue);
router.delete("/:id", authenticateUser(), deleteIssue);

// Comments
router.post("/:id/comments", authenticateUser(), addIssueComment);
router.get("/:id/comments", authenticateUser(), getIssueComments);

export default router;