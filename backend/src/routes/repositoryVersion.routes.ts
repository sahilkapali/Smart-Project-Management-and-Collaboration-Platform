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

// ======================================================
// CREATE REPOSITORY VERSION
// POST /api/repositories/:id/versions
// ======================================================

router.post(
  "/:id/versions",
  authenticateUser(),
  upload.single("file"),
  createVersion,
);

// ======================================================
// GET ALL REPOSITORY VERSIONS
// GET /api/repositories/:id/versions
// ======================================================

router.get("/:id/versions", authenticateUser(), getVersions);

// ======================================================
// GET VERSION BY ID
// GET /api/repositories/:id/versions/:versionId
// ======================================================

router.get("/:id/versions/:versionId", authenticateUser(), getVersionById);

// ======================================================
// DELETE VERSION
// DELETE /api/repositories/:id/versions/:versionId
// ======================================================

router.delete("/:id/versions/:versionId", authenticateUser(), deleteVersion);

export default router;
