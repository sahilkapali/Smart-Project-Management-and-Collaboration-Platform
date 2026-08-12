import { Schema, model } from 'mongoose';

import {
  IActivity,
  ActivityAction,
  ActivityEntityType
} from '../types/activity.types';

const activitySchema = new Schema<IActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true
    },

    action: {
      type: String,
      enum: Object.values(ActivityAction),
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    entityType: {
      type: String,
      enum: Object.values(ActivityEntityType)
    },

    entityId: {
      type: Schema.Types.ObjectId
    }
  },
  {
    timestamps: true
  }
);

export default model<IActivity>(
  'Activity',
  activitySchema
);