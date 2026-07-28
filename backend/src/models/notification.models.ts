import { Schema, model } from 'mongoose';
import { INotification, NotificationType } from '../types/notification.types';

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { 
      type: String, 
      enum: Object.values(NotificationType), 
      required: true 
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedEntityId: { type: Schema.Types.ObjectId }
  },
  { timestamps: true }
);

export default model<INotification>('Notification', notificationSchema);