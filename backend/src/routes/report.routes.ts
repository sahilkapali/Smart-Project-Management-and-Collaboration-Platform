import { Router } from 'express';
import { getProjectReport } from '../controllers/report.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

router.get('/project/:projectId', authenticateUser(), getProjectReport);

export default router;