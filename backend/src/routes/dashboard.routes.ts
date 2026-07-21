import { Router } from 'express';
import { getSprintDashboardMetrics } from '../controllers/dashboard.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();


router.get('/metrics/sprint/:sprintId', authenticateUser(), getSprintDashboardMetrics);

export default router;