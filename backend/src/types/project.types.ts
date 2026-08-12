import { Document, Types } from 'mongoose';


// =====================================================
// PROJECT STATUS
// =====================================================

export enum PROJECT_STATUS {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}


// =====================================================
// PROJECT INTERFACE
// =====================================================

export interface IProject extends Document {
  name: string;

  description?: string;

  team: Types.ObjectId;

  createdBy: Types.ObjectId;

  members: Types.ObjectId[];

  status: PROJECT_STATUS;

  startDate?: Date;

  dueDate?: Date;

  createdAt?: Date;

  updatedAt?: Date;
}