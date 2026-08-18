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
// CREATE ISSUE
// POST /issues
// ============================================================

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

// ============================================================
// GET ALL ISSUES
// GET /issues
// ============================================================

router.get("/", authenticateUser(), getIssues);

// ============================================================
// ISSUE COMMENTS
// IMPORTANT:
// These routes are placed BEFORE /:id
// ============================================================

// ------------------------------------------------------------
// GET ISSUE COMMENTS
// GET /issues/:id/comments
// ------------------------------------------------------------

router.get("/:id/comments", authenticateUser(), getIssueComments);

// ------------------------------------------------------------
// ADD ISSUE COMMENT
// POST /issues/:id/comments
// ------------------------------------------------------------

router.post("/:id/comments", authenticateUser(), addIssueComment);

// ============================================================
// GET ISSUE BY ID
// GET /issues/:id
// ============================================================

router.get("/:id", authenticateUser(), getIssueById);

// ============================================================
// UPDATE ISSUE
// PUT /issues/:id
// ============================================================

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

// ============================================================
// DELETE ISSUE
// DELETE /issues/:id
// ============================================================

router.delete("/:id", authenticateUser(), deleteIssue);

// ============================================================
// EXPORT
// ============================================================

export default router;
