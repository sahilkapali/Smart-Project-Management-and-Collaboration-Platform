import { Router } from 'express';
import { getSprintDashboardMetrics } from '../controllers/dashboard.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { getKanbanBoard } from '../controllers/dashboard.controller';

const router = Router();


router.get('/metrics/sprint/:sprintId', authenticateUser(), getSprintDashboardMetrics);
router.get("/kanban/:projectId", authenticateUser(), getKanbanBoard);

export default router;


