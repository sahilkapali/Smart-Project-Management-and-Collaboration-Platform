import { Router } from "express";

import {
  createRepository,
  getRepositories,
  getProjectRepositories,
  getRepositoryById,
  updateRepository,
  deleteRepository,
} from "../controllers/repository.controller";

import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

// =====================================================
// AUTHENTICATION
// =====================================================
//
// Every repository endpoint requires a logged-in user.
//

router.use(authenticateUser);

// =====================================================
// CREATE REPOSITORY
// =====================================================
//
// POST /api/repositories
//

router.post("/", createRepository);

// =====================================================
// GET ALL ACCESSIBLE REPOSITORIES
// =====================================================
//
// GET /api/repositories
//
// Returns repositories that the authenticated user is
// allowed to access.
//

router.get("/", getRepositories);

// =====================================================
// GET PROJECT REPOSITORIES
// =====================================================
//
// GET /api/repositories/project/:projectId
//
// IMPORTANT:
// This route MUST be before /:id.
//

router.get("/project/:projectId", getProjectRepositories);

// =====================================================
// GET REPOSITORY BY ID
// =====================================================
//
// GET /api/repositories/:id
//

router.get("/:id", getRepositoryById);

// =====================================================
// UPDATE REPOSITORY
// =====================================================
//
// PUT /api/repositories/:id
//

router.put("/:id", updateRepository);

// =====================================================
// DELETE REPOSITORY
// =====================================================
//
// DELETE /api/repositories/:id
//

router.delete("/:id", deleteRepository);

export default router;
