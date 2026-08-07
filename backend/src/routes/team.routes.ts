import { Router } from 'express';
import { handleCreateTeam, handleGetTeams } from '../controllers/team.controller';
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

router.post('/', authenticateUser(), handleCreateTeam);
router.get('/', authenticateUser(), handleGetTeams);

export default router;