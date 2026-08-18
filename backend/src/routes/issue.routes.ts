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
import { validate } from "../middleware/validation.middleware";

const router = Router();

// ============================================================
// ISSUE CRUD
// ============================================================

// Create Issue
router.post(
  "/",
  authenticateUser(),
  validate([
    {
      field: "repository",
      location: "body",
      required: true,
      isObjectId: true,
    },
    {
      field: "title",
      location: "body",
      required: true,
      minLength: 3,
    },
    {
      field: "priority",
      location: "body",
      enum: ["Low", "Medium", "High", "Critical"],
    },
    {
      field: "assignedTo",
      location: "body",
      isObjectId: true,
    },
  ]),
  createIssue,
);

// Get All Issues
router.get("/", authenticateUser(), getIssues);

// Get Issue By ID
router.get("/:id", authenticateUser(), getIssueById);

// Update Issue
router.put(
  "/:id",
  authenticateUser(),
  validate([
    {
      field: "title",
      location: "body",
      minLength: 3,
    },
    {
      field: "priority",
      location: "body",
      enum: ["Low", "Medium", "High", "Critical"],
    },
    {
      field: "status",
      location: "body",
      enum: ["Open", "In Progress", "Resolved", "Closed"],
    },
    {
      field: "assignedTo",
      location: "body",
      isObjectId: true,
    },
  ]),
  updateIssue,
);

// Delete Issue
router.delete("/:id", authenticateUser(), deleteIssue);

// ============================================================
// ISSUE COMMENTS
// ============================================================

// Add Comment
router.post("/:id/comments", authenticateUser(), addIssueComment);

// Get Comments
router.get("/:id/comments", authenticateUser(), getIssueComments);

export default router;
