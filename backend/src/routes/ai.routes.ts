import { Router } from 'express';
import { getProjectInsight } from '../controllers/ai.controller';
//import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

//router.post('/insight', authenticateUser(), getProjectInsight);

export default router;