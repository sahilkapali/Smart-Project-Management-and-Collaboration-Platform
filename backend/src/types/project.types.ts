import mongoose, { Document } from "mongoose";

export type PROJECT_STATUS = "PLANNING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface IProject extends Document {
  name: string;

  description?: string;

  team: mongoose.Types.ObjectId;

  createdBy: mongoose.Types.ObjectId;

  status: PROJECT_STATUS;

  startDate?: Date;

  dueDate?: Date;

  createdAt: Date;

  updatedAt: Date;
}
