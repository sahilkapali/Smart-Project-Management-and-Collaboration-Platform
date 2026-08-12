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

// 1. Create Task (Validates required body fields, enums, dates, and ObjectId)
router.post(
  "/",
  authenticateUser(),
  validate([
    { field: "title", location: "body", required: true, minLength: 3 },
    { field: "projectId", location: "body", required: true, isObjectId: true },
    { field: "priority", location: "body", enum: ["Low", "Medium", "High"] },
    { field: "status", location: "body", enum: ["Todo", "Pending", "In Progress", "Completed"] },
    { field: "dueDate", location: "body", isDate: true },
  ]),
  createTask
);

// Kanban
router.get("/project/:projectId/kanban", authenticateUser(), getKanban);
router.patch("/:id/status", authenticateUser(), updateKanbanStatus);

// Comments
router.post("/:id/comments", authenticateUser(), addTaskComment);
router.get("/:id/comments", authenticateUser(), getTaskComments);
router.delete(
  "/:taskId/comments/:commentId",
  authenticateUser(),
  deleteTaskComment
);

// AI
router.patch("/:id/ai-prioritize", authenticateUser(), autoPrioritizeTask);

export default router;