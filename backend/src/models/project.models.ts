import { Schema, model } from 'mongoose';

import {
  IProject,
  PROJECT_STATUS
} from '../types/project.types';


const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.PLANNING
    },

    startDate: {
      type: Date
    },

    dueDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);


export default model<IProject>(
  'Project',
  projectSchema
);