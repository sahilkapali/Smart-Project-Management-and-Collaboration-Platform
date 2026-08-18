import { Schema, model } from "mongoose";

import {
  IActivity,
  ActivityAction,
  ActivityEntityType,
} from "../types/activity.types";

const activitySchema = new Schema<IActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: false,
      index: true,
    },

    action: {
      type: String,
      enum: Object.values(ActivityAction),
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    entityType: {
      type: String,
      enum: Object.values(ActivityEntityType),
      required: false,
      index: true,
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

export default model<IActivity>("Activity", activitySchema);
