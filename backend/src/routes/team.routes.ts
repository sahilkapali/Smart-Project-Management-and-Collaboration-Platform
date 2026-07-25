import { Router } from 'express';
import { handleCreateTeam, handleGetTeams } from '../controllers/team.controller';
import { verifyToken } from "../utils/generateToken.utils";

const router = Router();

router.post('/', verifyToken, handleCreateTeam);
router.get('/', verifyToken, handleGetTeams);

export default router;