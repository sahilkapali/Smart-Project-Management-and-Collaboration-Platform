import mongoose, { Schema, Document } from "mongoose";
import { ITask } from '../types/task.types';

const TaskSchema = new Schema<ITask>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
      index: true, 
    },

    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true, 
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Todo", "In Progress", "Completed"],
      default: "Todo",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true, 
    },

    dueDate: {
      type: Date,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>("Task", TaskSchema);