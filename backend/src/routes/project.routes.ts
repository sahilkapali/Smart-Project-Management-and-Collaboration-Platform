import { Router } from 'express';
import { createProject, addMember } from '../controllers/project.controller';
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

router.post('/', authenticateUser(), createProject);
router.post('/:id/members', authenticateUser(), addMember);

export default router;