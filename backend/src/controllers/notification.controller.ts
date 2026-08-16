import { Request, Response, NextFunction } from "express";

import * as notificationService from "../services/notification.service";

/**
 * ============================================================
 * GET MY NOTIFICATIONS
 * ============================================================
 *
 * GET /api/notifications
 *
 * Returns notifications belonging to the logged-in user.
 */
export const getMyNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const notifications =
      await notificationService.getUserNotifications(userId);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================================
 * GET ONE NOTIFICATION
 * ============================================================
 *
 * GET /api/notifications/:id
 *
 * Only the recipient can view their notification.
 */
export const getMyNotificationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const notificationId = req.params.id as string;

    if (!notificationId) {
      res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
      return;
    }

    const notification = await notificationService.getNotificationById(
      notificationId,
      userId,
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================================
 * GET UNREAD NOTIFICATION COUNT
 * ============================================================
 *
 * GET /api/notifications/unread-count
 */
export const getUnreadNotificationCount = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: {
        count,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================================
 * MARK ONE NOTIFICATION AS READ
 * ============================================================
 *
 * PATCH /api/notifications/:id/read
 */
export const readNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const notificationId = req.params.id as string;

    if (!notificationId) {
      res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
      return;
    }

    const updated = await notificationService.markAsRead(
      notificationId,
      userId,
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        message: "Notification not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================================
 * MARK ALL NOTIFICATIONS AS READ
 * ============================================================
 *
 * PATCH /api/notifications/read-all
 */
export const readAllNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const result = await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================================
 * DELETE ONE NOTIFICATION
 * ============================================================
 *
 * DELETE /api/notifications/:id
 *
 * A user can only delete their own notification.
 */
export const deleteMyNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const notificationId = req.params.id as string;

    if (!notificationId) {
      res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
      return;
    }

    const deleted = await notificationService.deleteNotification(
      notificationId,
      userId,
    );

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Notification not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================================
 * CLEAR READ NOTIFICATIONS
 * ============================================================
 *
 * DELETE /api/notifications/read
 *
 * Deletes all notifications that the current user
 * has already read.
 */
export const clearReadNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const result = await notificationService.clearReadNotifications(userId);

    res.status(200).json({
      success: true,
      message: "Read notifications cleared successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
