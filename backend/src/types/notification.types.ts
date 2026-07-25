import { Schema, model, Document, Types } from 'mongoose';


export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

export interface INotification extends Document {
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  type: NotificationType;
  message: string;
  isRead: boolean;
  relatedEntityId?: Types.ObjectId; 
  createdAt: Date;
}