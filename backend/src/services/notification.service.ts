import { Types } from "mongoose";

import Notification from "../models/notification.models";

import {
  NotificationType,
  NotificationEntityType,
} from "../types/notification.types";

// =====================================================
// CREATE NOTIFICATION
// =====================================================

export const createNotification = async (
  recipientId: string,
  message: string,
  type: NotificationType,
  senderId?: string,
  relatedEntityId?: string,
  relatedEntityType?: NotificationEntityType,
) => {
  return Notification.create({
    recipient: new Types.ObjectId(recipientId),

    sender: senderId ? new Types.ObjectId(senderId) : undefined,

    type,

    message,

    relatedEntityId: relatedEntityId
      ? new Types.ObjectId(relatedEntityId)
      : undefined,

    relatedEntityType,

    isRead: false,
  });
};

// =====================================================
// GET USER NOTIFICATIONS
// =====================================================

export const getUserNotifications = async (userId: string) => {
  return Notification.find({
    recipient: new Types.ObjectId(userId),
  })
    .populate("sender", "firstName lastName email profileImage")
    .sort({
      createdAt: -1,
    })
    .limit(50)
    .lean();
};

// =====================================================
// GET ONE NOTIFICATION
// =====================================================

export const getNotificationById = async (
  notificationId: string,
  userId: string,
) => {
  return Notification.findOne({
    _id: notificationId,
    recipient: new Types.ObjectId(userId),
  })
    .populate("sender", "firstName lastName email profileImage")
    .lean();
};

// =====================================================
// GET UNREAD COUNT
// =====================================================

export const getUnreadCount = async (userId: string) => {
  return Notification.countDocuments({
    recipient: new Types.ObjectId(userId),
    isRead: false,
  });
};

// =====================================================
// MARK ONE AS READ
// =====================================================

export const markAsRead = async (notificationId: string, userId: string) => {
  return Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: new Types.ObjectId(userId),
    },
    {
      $set: {
        isRead: true,
      },
    },
    {
      new: true,
    },
  );
};

// =====================================================
// MARK ALL AS READ
// =====================================================

export const markAllAsRead = async (userId: string) => {
  return Notification.updateMany(
    {
      recipient: new Types.ObjectId(userId),
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    },
  );
};

// =====================================================
// DELETE ONE
// =====================================================

export const deleteNotification = async (
  notificationId: string,
  userId: string,
) => {
  return Notification.findOneAndDelete({
    _id: notificationId,
    recipient: new Types.ObjectId(userId),
  });
};

// =====================================================
// DELETE ALL READ NOTIFICATIONS
// =====================================================

export const clearReadNotifications = async (userId: string) => {
  return Notification.deleteMany({
    recipient: new Types.ObjectId(userId),
    isRead: true,
  });
};
