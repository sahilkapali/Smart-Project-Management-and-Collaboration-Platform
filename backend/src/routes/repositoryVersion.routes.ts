import { Router } from "express";

import {
  createVersion,
  getVersions,
  getVersionById,
  deleteVersion,
} from "../controllers/repositoryVersion.controller";

import { verifyToken } from "../utils/generateToken.utils";

import upload from "../middleware/upload.middleware";

const router = Router();

// ======================================================
// CREATE REPOSITORY VERSION
// ======================================================

router.post(
  "/:id/versions",
  verifyToken,
  upload.single("file"),
  createVersion
);

// ======================================================
// GET ALL VERSIONS
// ======================================================

router.get(
  "/:id/versions",
  verifyToken,
  getVersions
);

// ======================================================
// GET VERSION BY ID
// ======================================================

router.get(
  "/:id/versions/:versionId",
  verifyToken,
  getVersionById
);

// ======================================================
// DELETE VERSION
// ======================================================

router.delete(
  "/:id/versions/:versionId",
  verifyToken,
  deleteVersion
);

export default router;