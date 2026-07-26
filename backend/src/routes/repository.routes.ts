import { Router } from "express";

import {
  createRepository,
  getRepositories,
  getRepositoryById,
  updateRepository,
  deleteRepository,
} from "../controllers/repository.controller";

import { verifyToken } from "../utils/generateToken.utils";

const router = Router();

// Create Repository
router.post("/", verifyToken, createRepository);

// Get All Repositories
router.get("/", verifyToken, getRepositories);

// Get Repository By ID
router.get("/:id", verifyToken, getRepositoryById);

// Update Repository
router.put("/:id", verifyToken, updateRepository);

// Delete Repository
router.delete("/:id", verifyToken, deleteRepository);

export default router;