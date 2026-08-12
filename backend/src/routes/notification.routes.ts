import { Router } from 'express';

import {
  getMyNotifications,
  getUnreadNotificationCount,
  readNotification,
  readAllNotifications
} from '../controllers/notification.controller';

import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();


// Get all notifications
router.get(
  '/',
  authenticateUser(),
  getMyNotifications
);


// Get unread notification count
router.get(
  '/unread-count',
  authenticateUser(),
  getUnreadNotificationCount
);


// Mark one notification as read
router.patch(
  '/:id/read',
  authenticateUser(),
  readNotification
);


// Mark all notifications as read
router.patch(
  '/read-all',
  authenticateUser(),
  readAllNotifications
);

export default router;