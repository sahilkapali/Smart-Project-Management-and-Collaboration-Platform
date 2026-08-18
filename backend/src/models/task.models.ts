import mongoose, { Schema } from "mongoose";

import { ITask, TASK_STATUS, TASK_PRIORITY } from "../types/task.types";

const taskSchema = new Schema<ITask>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [3, "Task title must be at least 3 characters"],
      maxlength: [200, "Task title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Task description cannot exceed 2000 characters"],
      default: "",
    },

    status: {
      type: String,
      enum: ["Todo", "In Progress", "Completed"],
      default: "Todo",
      required: true,
      index: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      required: true,
      index: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({
  project: 1,
  status: 1,
});

taskSchema.index({
  project: 1,
  priority: 1,
});

taskSchema.index({
  project: 1,
  dueDate: 1,
});

export default mongoose.model<ITask>("Task", taskSchema);
