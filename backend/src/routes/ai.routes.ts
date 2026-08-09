import { Router } from 'express';
import { generateInsight } from '../controllers/ai.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

router.post('/insight', authenticateUser(), generateInsight);

export default router;