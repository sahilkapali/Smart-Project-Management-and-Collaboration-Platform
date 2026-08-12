import {
  Request,
  Response,
  NextFunction
} from 'express';

import * as notificationService
  from '../services/notification.service';


// Get logged-in user's notifications
export const getMyNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const notifications =
      await notificationService.getUserNotifications(userId);

    return res.status(200).json({
      success: true,
      data: notifications
    });

  } catch (error) {
    next(error);
  }
};


// Get unread notification count
export const getUnreadNotificationCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const count =
      await notificationService.getUnreadCount(userId);

    return res.status(200).json({
      success: true,
      data: {
        count
      }
    });

  } catch (error) {
    next(error);
  }
};


// Mark one notification as read
export const readNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Explicitly convert the route parameter to string
    const id = req.params.id as string;

    const updated =
      await notificationService.markAsRead(
        id,
        userId
      );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: updated
    });

  } catch (error) {
    next(error);
  }
};


// Mark all notifications as read
export const readAllNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await notificationService.markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    next(error);
  }
};