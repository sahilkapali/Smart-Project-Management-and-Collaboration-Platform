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

const router = Router();

router.post("/", authenticateUser(), createTask);
router.get("/", authenticateUser(), getTasks);
router.get("/:id", authenticateUser(), getTaskById);
router.put("/:id", authenticateUser(), updateTask);
router.delete("/:id", authenticateUser(), deleteTask);

router.patch("/:id/status", authenticateUser(), updateKanbanStatus);
router.post("/:id/comments", authenticateUser(), addTaskComment);

router.patch("/:id/ai-prioritize", authenticateUser(), autoPrioritizeTask);

export default router;

