import { Router } from "express";

import {
  createFileOrFolder,
  getRepositoryFiles,
  getFileById,
  updateFile,
  deleteFile,
} from "../controllers/repositoryFile.controller";

import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

// =====================================================
// AUTHENTICATION
// =====================================================
router.use(authenticateUser);

// =====================================================
// FILE & FOLDER ROUTES
// =====================================================

// POST /api/repository-files
router.post("/", createFileOrFolder);

// GET /api/repository-files/repository/:repositoryId (Supports ?versionId= query param)
router.get("/repository/:repositoryId", getRepositoryFiles);

// GET /api/repository-files/:id
router.get("/:id", getFileById);

// PUT /api/repository-files/:id
router.put("/:id", updateFile);

// DELETE /api/repository-files/:id
router.delete("/:id", deleteFile);

export default router;