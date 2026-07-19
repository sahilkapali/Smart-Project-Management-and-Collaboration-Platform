import { Router } from "express";
import {
  createRepository,
  getRepositories,
  getRepositoryById,
  updateRepository,
  deleteRepository,
  createVersion,
  getVersions,
} from "../controllers/repository.controller";

import { verifyToken } from "../utils/generateToken.utils";

const router = Router();

// Repository CRUD
router.post("/", verifyToken, createRepository);
router.get("/", verifyToken, getRepositories);
router.get("/:id", verifyToken, getRepositoryById);
router.put("/:id", verifyToken, updateRepository);
router.delete("/:id", verifyToken, deleteRepository);

// Repository Version History
router.post("/:id/versions", verifyToken, createVersion);
router.get("/:id/versions", verifyToken, getVersions);

export default router;