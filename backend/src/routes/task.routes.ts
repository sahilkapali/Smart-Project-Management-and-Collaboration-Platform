import { Router } from "express";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";

import { verifyToken } from "../utils/generateToken.utils";

const router = Router();

// Create Task
router.post("/", verifyToken, createTask);

// Get All Tasks
router.get("/", verifyToken, getTasks);

// Get Task By ID
router.get("/:id", verifyToken, getTaskById);

// Update Task
router.put("/:id", verifyToken, updateTask);

// Delete Task
router.delete("/:id", verifyToken, deleteTask);

export default router;