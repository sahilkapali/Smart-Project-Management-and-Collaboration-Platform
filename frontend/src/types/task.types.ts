export type TaskStatus = "Todo" | "In Progress" | "Completed";

export type TaskPriority = "Low" | "Medium" | "High" | "Critical";

// ============================================================
// USER
// ============================================================

export interface TaskUser {
  _id: string;

  firstName?: string;

  lastName?: string;

  name?: string;

  email: string;

  role?: string;
}

// ============================================================
// PROJECT
// ============================================================

export interface TaskProject {
  _id: string;

  name: string;

  description?: string;
}

// ============================================================
// TASK
// ============================================================

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

  // Returned when AI prioritizes project tasks
  aiPriorityReason?: string;

  createdAt?: string;

  updatedAt?: string;
}

// ============================================================
// CREATE TASK
// ============================================================

export interface CreateTaskPayload {
  project: string;

  title: string;

  description?: string;

  assignedTo?: string;

  dueDate?: string;

  priority?: TaskPriority;
}

// ============================================================
// UPDATE TASK
// ============================================================

export interface UpdateTaskPayload {
  title?: string;

  description?: string;

  status?: TaskStatus;

  priority?: TaskPriority;

  assignedTo?: string | null;

  dueDate?: string | null;
}

// ============================================================
// COMMENTS
// ============================================================

export interface TaskCommentUser {
  _id: string;

  firstName?: string;

  lastName?: string;

  name?: string;

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

// ============================================================
// RESPONSES
// ============================================================

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

// ============================================================
// AI PROJECT PRIORITIZATION
// ============================================================

export interface AutoPrioritizeProjectTasksResponse {
  success: boolean;

  message?: string;

  count?: number;

  data: Task[];
}
