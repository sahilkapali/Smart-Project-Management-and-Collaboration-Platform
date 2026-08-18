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

// ============================================================
// TASK CRUD
// ============================================================

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
      field: "assignedTo",
      location: "body",
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

router.get("/", authenticateUser(), getTasks);

router.get("/project/:projectId/kanban", authenticateUser(), getKanban);

router.get("/:id", authenticateUser(), getTaskById);

router.put("/:id", authenticateUser(), updateTask);

router.delete("/:id", authenticateUser(), deleteTask);

// ============================================================
// KANBAN
// ============================================================

router.patch("/:id/status", authenticateUser(), updateKanbanStatus);

// ============================================================
// COMMENTS
// ============================================================

router.post("/:id/comments", authenticateUser(), addTaskComment);

router.get("/:id/comments", authenticateUser(), getTaskComments);

router.delete(
  "/:taskId/comments/:commentId",
  authenticateUser(),
  deleteTaskComment,
);

// ============================================================
// AI
// ============================================================

router.patch("/:id/ai-prioritize", authenticateUser(), autoPrioritizeTask);

export default router;
