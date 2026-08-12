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

const router = Router();

router.post("/", authenticateUser(), createTask);
router.get("/", authenticateUser(), getTasks);
router.get("/:id", authenticateUser(), getTaskById);
router.put("/:id", authenticateUser(), updateTask);
router.delete("/:id", authenticateUser(), deleteTask);

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