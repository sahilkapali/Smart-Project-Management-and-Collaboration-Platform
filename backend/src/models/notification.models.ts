import { Schema, model } from "mongoose";

import {
  INotification,
  NotificationType,
  NotificationEntityType,
} from "../types/notification.types";

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    relatedEntityId: {
      type: Schema.Types.ObjectId,
      required: false,
    },

    relatedEntityType: {
      type: String,
      enum: Object.values(NotificationEntityType),
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

export default model<INotification>("Notification", notificationSchema);
