import { Router } from 'express';

import {
  getActivities,
  getProjectActivities,
  getActivityById,
  deleteActivity
} from '../controllers/activity.controller';

import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();


// Get all activities
router.get(
  '/',
  authenticateUser(),
  getActivities
);


// Get activities for a project
router.get(
  '/project/:projectId',
  authenticateUser(),
  getProjectActivities
);


// Get one activity
router.get(
  '/:id',
  authenticateUser(),
  getActivityById
);


// Delete activity
router.delete(
  '/:id',
  authenticateUser(),
  deleteActivity
);

export default router;