import { Router } from "express";

import { getProjectReport } from "../controllers/report.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

/**
 * GET PROJECT REPORT
 *
 * GET /api/reports/project/:projectId
 *
 * Any authenticated user can access a project report.
 */
router.get("/project/:projectId", authenticateUser(), getProjectReport);

export default router;
