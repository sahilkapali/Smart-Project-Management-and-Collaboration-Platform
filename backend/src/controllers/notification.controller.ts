import { Request, Response, NextFunction } from "express";

import * as notificationService from "../services/notification.service";


// ============================================================
// HELPER
// ============================================================

const getNotificationId = (req: Request): string | null => {
  const value = req.params.id;

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return value;
};

// ============================================================
// GET MY NOTIFICATIONS
// ============================================================
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

// ============================================================
// GET ONE NOTIFICATION
// ============================================================
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

    const notificationId = getNotificationId(req);

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

// ============================================================
// GET UNREAD NOTIFICATION COUNT
// ============================================================
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

// ============================================================
// MARK ONE NOTIFICATION AS READ
// ============================================================
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

    const notificationId = getNotificationId(req);

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

// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================
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

// ============================================================
// DELETE ALL NOTIFICATIONS
// ============================================================
//
// DELETE /api/notifications
// ============================================================
export const deleteAllNotifications = async (
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

    const result = await notificationService.deleteAllNotifications(userId);

    res.status(200).json({
      success: true,
      message: "All notifications cleared successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE ONE NOTIFICATION
// ============================================================
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

    const notificationId = getNotificationId(req);

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

// ============================================================
// CLEAR READ NOTIFICATIONS
// ============================================================
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