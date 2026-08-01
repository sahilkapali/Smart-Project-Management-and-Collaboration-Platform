import { Router } from "express";

import {
  createRepository,
  getRepositories,
  getRepositoryById,
  updateRepository,
  deleteRepository,
} from "../controllers/repository.controller";

import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();


// Create Repository
router.post("/", authenticateUser(), createRepository);

// Get All Repositories
router.get("/", authenticateUser(), getRepositories);

// Get Repository By ID
router.get("/:id", authenticateUser(), getRepositoryById);

// Update Repository
router.put("/:id", authenticateUser(), updateRepository);

// Delete Repository
router.delete("/:id", authenticateUser(), deleteRepository);

export default router;