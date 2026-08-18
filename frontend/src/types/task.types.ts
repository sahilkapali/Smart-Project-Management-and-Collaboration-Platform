export type TaskStatus = "Todo" | "In Progress" | "Completed";

export type TaskPriority = "Low" | "Medium" | "High" | "Critical";

export interface TaskUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export interface TaskProject {
  _id: string;
  name: string;
  description?: string;
}

export interface Task {
  _id?: string;

  id?: string;

  project: string | TaskProject;

  title: string;

  description?: string;

  status: TaskStatus;

  priority: TaskPriority;

  assignedTo?: string | TaskUser | null;

  dueDate?: string | null;

  createdBy: string | TaskUser;

  overdue?: boolean;

  createdAt?: string;

  updatedAt?: string;
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

  status?: TaskStatus;

  priority?: TaskPriority;

  assignedTo?: string;

  dueDate?: string;
}

export interface TaskCommentUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export interface TaskComment {
  _id: string;

  task: string;

  user: string | TaskCommentUser;

  text: string;

  createdAt?: string;

  updatedAt?: string;
}

export interface TaskResponse {
  success: boolean;

  message?: string;

  data: Task;
}

export interface TasksResponse {
  success: boolean;

  count?: number;

  data: Task[];
}

export interface KanbanResponse {
  success: boolean;

  data: {
    todo: Task[];

    inProgress: Task[];

    completed: Task[];
  };
}

export interface TaskCommentsResponse {
  success: boolean;

  count?: number;

  data: TaskComment[];
}
