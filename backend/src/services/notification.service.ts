import { Types } from 'mongoose';

import Notification from '../models/notification.models';

import {
  NotificationType,
  NotificationEntityType
} from '../types/notification.types';


// Create a notification
export const createNotification = async (
  recipientId: string,
  message: string,
  type: NotificationType,
  senderId?: string,
  relatedEntityId?: string,
  relatedEntityType?: NotificationEntityType
) => {
  return await Notification.create({
    recipient: new Types.ObjectId(recipientId),

    sender: senderId
      ? new Types.ObjectId(senderId)
      : undefined,

    type,

    message,

    relatedEntityId: relatedEntityId
      ? new Types.ObjectId(relatedEntityId)
      : undefined,

    relatedEntityType
  });
};


// Get notifications for the logged-in user
export const getUserNotifications = async (
  userId: string
) => {
  return await Notification.find({
    recipient: userId
  })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(50);
};


// Mark one notification as read
export const markAsRead = async (
  notificationId: string,
  userId: string
) => {
  return await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId
    },
    {
      isRead: true
    },
    {
      new: true
    }
  );
};


// Mark all notifications as read
export const markAllAsRead = async (
  userId: string
) => {
  return await Notification.updateMany(
    {
      recipient: userId,
      isRead: false
    },
    {
      isRead: true
    }
  );
};


// Get unread notification count
export const getUnreadCount = async (
  userId: string
) => {
  return await Notification.countDocuments({
    recipient: userId,
    isRead: false
  });
};