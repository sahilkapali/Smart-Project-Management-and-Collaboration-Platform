import { Router } from "express";

import {
  getMyNotifications,
  getMyNotificationById,
  getUnreadNotificationCount,
  readNotification,
  readAllNotifications,
  deleteMyNotification,
  clearReadNotifications,
} from "../controllers/notification.controller";

import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

// Get notifications
router.get("/", authenticateUser(), getMyNotifications);

// Get unread count
router.get("/unread-count", authenticateUser(), getUnreadNotificationCount);

// Get one notification
router.get("/:id", authenticateUser(), getMyNotificationById);

// Mark one as read
router.patch("/:id/read", authenticateUser(), readNotification);

// Mark all as read
router.patch("/read-all", authenticateUser(), readAllNotifications);

// Delete one notification
router.delete("/:id", authenticateUser(), deleteMyNotification);

// Clear read notifications
router.delete("/clear/read", authenticateUser(), clearReadNotifications);

export default router;
