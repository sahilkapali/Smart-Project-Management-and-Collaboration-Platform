import { Router } from "express";

import {
  createVersion,
  getVersions,
  getVersionById,
  deleteVersion,
} from "../controllers/repositoryVersion.controller";

import { verifyToken } from "../utils/generateToken.utils";

const router = Router();

// Create version
router.post("/:id/versions", verifyToken, createVersion);

// Get all versions of repository
router.get("/:id/versions", verifyToken, getVersions);

// Get specific version
router.get(
  "/:id/versions/:versionId",
  verifyToken,
  getVersionById
);

// Delete version
router.delete(
  "/:id/versions/:versionId",
  verifyToken,
  deleteVersion
);

export default router;