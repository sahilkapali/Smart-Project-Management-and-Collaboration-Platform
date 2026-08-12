import { Document, Types } from 'mongoose';

export interface IRepository extends Document {
  project: Types.ObjectId;
  name: string;
  description?: string;
  githubUrl?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}