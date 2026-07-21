import { NotificationType } from '../types/notification.types';
import Notification from '../models/notification.models';



export const createNotification = async (
  recipientId: string,
  message: string,
  type: NotificationType,
  senderId?: string,
  relatedEntityId?: string
) => {
  return await Notification.create({
    recipient: recipientId,
    sender: senderId,
    type,
    message,
    relatedEntityId
  });
};

export const getUserNotifications = async (userId: string) => {
  return await Notification.find({ recipient: userId })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(50);
};

export const markAsRead = async (notificationId: string, userId: string) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId: string) => {
  return await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};