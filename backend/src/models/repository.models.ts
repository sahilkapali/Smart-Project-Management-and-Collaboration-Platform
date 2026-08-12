import { Schema, model } from 'mongoose';

import { IRepository } from '../types/repository.types';

const repositorySchema = new Schema<IRepository>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    githubUrl: {
      type: String,
      trim: true
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default model<IRepository>(
  'Repository',
  repositorySchema
);