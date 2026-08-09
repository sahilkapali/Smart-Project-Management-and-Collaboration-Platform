import { Router } from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateKanbanStatus,
  addTaskComment,
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

// 2. Get All Tasks (Validates optional projectId query param if passed)
router.get(
  "/",
  authenticateUser(),
  validate([
    { field: "projectId", location: "query", isObjectId: true },
  ]),
  getTasks
);

// 3. Get Task by ID (Validates parameter ID format)
router.get(
  "/:id",
  authenticateUser(),
  validate([
    { field: "id", location: "params", required: true, isObjectId: true },
  ]),
  getTaskById
);

// 4. Update Task Details
router.put(
  "/:id",
  authenticateUser(),
  validate([
    { field: "id", location: "params", required: true, isObjectId: true },
    { field: "title", location: "body", minLength: 3 },
    { field: "projectId", location: "body", isObjectId: true },
    { field: "priority", location: "body", enum: ["Low", "Medium", "High"] },
    { field: "status", location: "body", enum: ["Todo", "Pending", "In Progress", "Completed"] },
    { field: "dueDate", location: "body", isDate: true },
  ]),
  updateTask
);

// 5. Delete Task
router.delete(
  "/:id",
  authenticateUser(),
  validate([
    { field: "id", location: "params", required: true, isObjectId: true },
  ]),
  deleteTask
);

// 6. Update Kanban Status
router.patch(
  "/:id/status",
  authenticateUser(),
  validate([
    { field: "id", location: "params", required: true, isObjectId: true },
    { field: "status", location: "body", required: true, enum: ["Todo", "Pending", "In Progress", "Completed"] },
  ]),
  updateKanbanStatus
);

// 7. Add Task Comment
router.post(
  "/:id/comments",
  authenticateUser(),
  validate([
    { field: "id", location: "params", required: true, isObjectId: true },
    { field: "text", location: "body", required: true, minLength: 1 },
  ]),
  addTaskComment
);

// 8. AI Task Prioritization
router.patch(
  "/:id/ai-prioritize",
  authenticateUser(),
  validate([
    { field: "id", location: "params", required: true, isObjectId: true },
  ]),
  autoPrioritizeTask
);

export default router;