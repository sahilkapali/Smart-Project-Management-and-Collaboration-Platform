import mongoose, { Schema } from 'mongoose';

export interface ITask extends Document {
  project: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: "Todo" | "In Progress" | "Completed";
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: mongoose.Types.ObjectId;
  dueDate?: Date;
  createdBy: mongoose.Types.ObjectId;
}