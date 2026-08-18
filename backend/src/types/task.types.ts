import { Types } from "mongoose";

export type TASK_STATUS = "Todo" | "In Progress" | "Completed";

export type TASK_PRIORITY = "Low" | "Medium" | "High" | "Critical";

export interface ITask {
  project: Types.ObjectId;

  title: string;

  description?: string;

  status: TASK_STATUS;

  priority: TASK_PRIORITY;

  assignedTo?: Types.ObjectId | null;

  dueDate?: Date | null;

  createdBy: Types.ObjectId;
}
