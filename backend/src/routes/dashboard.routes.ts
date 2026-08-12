import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/dashboard.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

router.get('/metrics', authenticateUser(), getDashboardMetrics);

export default router;