import { Router } from "express";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateKanbanStatus,
  addTaskComment,
} from "../controllers/task.controller";

import { verifyToken } from "../utils/generateToken.utils";

const router = Router();

// CRUD Routes
router.post("/", verifyToken, createTask);
router.get("/", verifyToken, getTasks);
router.get("/:id", verifyToken, getTaskById);
router.put("/:id", verifyToken, updateTask);
router.delete("/:id", verifyToken, deleteTask);

// Kanban
router.patch("/:id/status", verifyToken, updateKanbanStatus);

// Comments
router.post("/:id/comments", verifyToken, addTaskComment);

export default router;