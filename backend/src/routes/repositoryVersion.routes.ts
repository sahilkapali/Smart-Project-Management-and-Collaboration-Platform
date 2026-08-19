import { Router } from "express";

import {
  createVersion,
  getVersions,
  getVersionById,
  deleteVersion,
} from "../controllers/repositoryVersion.controller";

import { authenticateUser } from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";

const router = Router();

// Apply authentication to all version routes
router.use(authenticateUser);

// ============================================================
// REPOSITORY VERSION ENDPOINTS
// Mounted under: /api/repositories
// ============================================================

// POST /api/repositories/:id/versions
router.post("/:id/versions", upload.single("file"), createVersion);

// GET /api/repositories/:id/versions
router.get("/:id/versions", getVersions);

// GET /api/repositories/:id/versions/:versionId
router.get("/:id/versions/:versionId", getVersionById);

// DELETE /api/repositories/:id/versions/:versionId
router.delete("/:id/versions/:versionId", deleteVersion);

export default router;