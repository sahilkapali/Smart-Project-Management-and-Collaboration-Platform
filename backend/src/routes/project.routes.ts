import { Router } from 'express';
import { handleCreateTeam, handleGetTeams } from '../controllers/team.controller';
import { verifyToken } from '../utils/generateToken.utils'; // Adjust path if your middleware is located elsewhere

const router = Router();

// POST /api/teams - Create a new team (Protected by Member 1's verifyToken middleware)
router.post('/', verifyToken, handleCreateTeam);

// GET /api/teams - Get all teams for the authenticated user (Protected by verifyToken)
router.get('/', verifyToken, handleGetTeams);

export default router;