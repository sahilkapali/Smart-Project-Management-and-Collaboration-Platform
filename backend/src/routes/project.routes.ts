import { Router } from 'express';
import { createProject, addMember } from '../controllers/project.controller';
import { verifyToken } from "../utils/generateToken.utils";

const router = Router();

router.post('/', verifyToken, createProject);
router.post('/:id/members', verifyToken, addMember);

export default router;