import { Router } from "express";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateKanbanStatus,
  getKanban,
  addTaskComment,
  getTaskComments,
  deleteTaskComment,
  autoPrioritizeTask,
} from "../controllers/task.controller";

import { authenticateUser } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";

const router = Router();

/**
 * =========================================================
 * TASK CRUD
 * =========================================================
 */

// Create Task
router.post(
  "/",
  authenticateUser(),
  validate([
    {
      field: "title",
      location: "body",
      required: true,
      minLength: 3,
    },
    {
      field: "project",
      location: "body",
      required: true,
      isObjectId: true,
    },
    {
      field: "priority",
      location: "body",
      enum: ["Low", "Medium", "High", "Critical"],
    },
    {
      field: "dueDate",
      location: "body",
      isDate: true,
    },
  ]),
  createTask,
);

// Get all tasks
router.get("/", authenticateUser(), getTasks);

// Get single task
router.get("/:id", authenticateUser(), getTaskById);

// Update task
router.put("/:id", authenticateUser(), updateTask);

// Delete task
router.delete("/:id", authenticateUser(), deleteTask);

/**
 * =========================================================
 * KANBAN
 * =========================================================
 */

// Get Kanban board for project
router.get("/project/:projectId/kanban", authenticateUser(), getKanban);

// Update task Kanban status
router.patch("/:id/status", authenticateUser(), updateKanbanStatus);

/**
 * =========================================================
 * TASK COMMENTS
 * =========================================================
 */

// Add comment
router.post("/:id/comments", authenticateUser(), addTaskComment);

// Get task comments
router.get("/:id/comments", authenticateUser(), getTaskComments);

// Delete comment
router.delete(
  "/:taskId/comments/:commentId",
  authenticateUser(),
  deleteTaskComment,
);

/**
 * =========================================================
 * AI TASK PRIORITIZATION
 * =========================================================
 */

// Automatically prioritize task using AI
router.patch("/:id/ai-prioritize", authenticateUser(), autoPrioritizeTask);

export default router;
