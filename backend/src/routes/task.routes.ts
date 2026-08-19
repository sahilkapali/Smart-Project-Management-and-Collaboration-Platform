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
  autoPrioritizeProjectTasks,
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

// ============================================================
// GET TASKS
// GET /api/tasks?project=PROJECT_ID
// ============================================================

router.get("/", authenticateUser(), getTasks);

// ============================================================
// PROJECT KANBAN
// GET /api/tasks/project/:projectId/kanban
// ============================================================
//
// IMPORTANT:
// This must be registered before /:id so that
// "project" is not interpreted as a task ID.
//

router.get("/project/:projectId/kanban", authenticateUser(), getKanban);

// ============================================================
// AI AUTO PRIORITIZE PROJECT TASKS
// PATCH /api/tasks/project/:projectId/ai-prioritize
// ============================================================
//
// IMPORTANT:
// This is PROJECT-WIDE.
//
// The frontend sends:
// projectId
//
// The controller then:
// 1. Checks authentication
// 2. Checks project access
// 3. Gets all project tasks
// 4. Sends them to Gemini
// 5. Gemini assigns priorities
// 6. Updates MongoDB
// 7. Returns the updated tasks
//
// This route MUST come before /:id.
//

router.patch(
  "/project/:projectId/ai-prioritize",
  authenticateUser(),
  autoPrioritizeProjectTasks,
);

// ============================================================
// GET SINGLE TASK
// GET /api/tasks/:id
// ============================================================

router.get("/:id", authenticateUser(), getTaskById);

// ============================================================
// UPDATE TASK
// PUT /api/tasks/:id
// ============================================================

router.put("/:id", authenticateUser(), updateTask);

// ============================================================
// DELETE TASK
// DELETE /api/tasks/:id
// ============================================================

router.delete("/:id", authenticateUser(), deleteTask);

// ============================================================
// UPDATE TASK STATUS
// PATCH /api/tasks/:id/status
// ============================================================

router.patch("/:id/status", authenticateUser(), updateKanbanStatus);

// ============================================================
// TASK COMMENTS
// ============================================================

// ADD COMMENT
// POST /api/tasks/:id/comments

router.post("/:id/comments", authenticateUser(), addTaskComment);

// GET COMMENTS
// GET /api/tasks/:id/comments

router.get("/:id/comments", authenticateUser(), getTaskComments);

// DELETE COMMENT
// DELETE /api/tasks/:taskId/comments/:commentId

router.delete(
  "/:taskId/comments/:commentId",
  authenticateUser(),
  deleteTaskComment,
);

export default router;
