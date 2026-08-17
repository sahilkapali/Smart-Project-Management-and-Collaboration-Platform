export type TaskStatus =
  | "Todo"
  | "In Progress"
  | "Completed";

export type TaskPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

export interface TaskUser {
  _id?: string;
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

export interface TaskProject {
  _id?: string;
  id?: string;
  name?: string;
}

export interface Task {
  _id?: string;
  id?: string;

  project:
    | string
    | TaskProject;

  title: string;

  description?: string;

  status: TaskStatus;

  priority: TaskPriority;

  assignedTo?:
    | string
    | TaskUser
    | null;

  dueDate?: string | null;

  createdBy?:
    | string
    | TaskUser;

  createdAt?: string;

  updatedAt?: string;

  overdue?: boolean;
}

export interface CreateTaskPayload {
  project: string;

  title: string;

  description?: string;

  assignedTo?: string;

  dueDate?: string;

  priority?: TaskPriority;
}

export interface UpdateTaskPayload {
  title?: string;

  description?: string;

  assignedTo?: string;

  dueDate?: string | null;

  priority?: TaskPriority;

  status?: TaskStatus;
}