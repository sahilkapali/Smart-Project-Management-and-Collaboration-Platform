import { Router } from 'express';
import { createProject, getProjects } from '../controllers/project.controller'; 
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();


router.post('/', authenticateUser(), createProject);


router.get('/', authenticateUser(), getProjects);

export default router;