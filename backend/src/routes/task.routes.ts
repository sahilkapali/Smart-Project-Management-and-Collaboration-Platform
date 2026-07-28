import { Router } from 'express';
import { createTask, updateKanbanStatus, addTaskComment } from '../controllers/task.controller';
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

router.post('/', authenticateUser(), createTask);
router.patch('/:id/status', authenticateUser(), updateKanbanStatus);
router.post('/:id/comments', authenticateUser(), addTaskComment);

export default router;