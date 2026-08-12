import { Document, Types } from 'mongoose';

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
  MEMBER_ADDED = 'MEMBER_ADDED',
  MEETING_INVITATION = 'MEETING_INVITATION',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

export enum NotificationEntityType {
  TASK = 'TASK',
  PROJECT = 'PROJECT',
  COMMENT = 'COMMENT',
  TEAM = 'TEAM',
  MEETING = 'MEETING'
}

export interface INotification extends Document {
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  type: NotificationType;
  message: string;
  isRead: boolean;
  relatedEntityId?: Types.ObjectId;
  relatedEntityType?: NotificationEntityType;
  createdAt: Date;
  updatedAt: Date;
}