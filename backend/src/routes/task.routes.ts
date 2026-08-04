import { Router } from 'express';
import { createTask, updateKanbanStatus, addTaskComment } from '../controllers/task.controller';
import { verifyToken } from "../utils/generateToken.utils";

const router = Router();

router.post('/', verifyToken, createTask);
router.patch('/:id/status', verifyToken, updateKanbanStatus);
router.post('/:id/comments', verifyToken, addTaskComment);

export default router;