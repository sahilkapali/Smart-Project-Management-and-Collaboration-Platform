import mongoose, { Schema } from 'mongoose';

export interface ITask extends Document {
  project: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: "Todo" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High" | "Critical";
  assignedTo?: mongoose.Types.ObjectId;
  dueDate?: Date;
  createdBy: mongoose.Types.ObjectId;
}