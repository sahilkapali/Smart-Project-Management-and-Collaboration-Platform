import api from "./api";

import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskStatus,
  TaskComment,
  TaskResponse,
  TasksResponse,
  KanbanResponse,
  TaskCommentsResponse,
} from "../types/task.types";

const taskService = {
  // ==========================================================
  // GET TASKS
  // GET /tasks?project=PROJECT_ID
  // ==========================================================

  async getTasks(projectId: string): Promise<Task[]> {
    if (!projectId) {
      throw new Error("Project ID is required.");
    }

    const response = await api.get<TasksResponse>("/tasks", {
      params: {
        project: projectId,
      },
    });

    return Array.isArray(response.data?.data) ? response.data.data : [];
  },

  // ==========================================================
  // GET TASK
  // GET /tasks/:id
  // ==========================================================

  async getTaskById(taskId: string): Promise<Task> {
    if (!taskId) {
      throw new Error("Task ID is required.");
    }

    const response = await api.get<TaskResponse>(`/tasks/${taskId}`);

    return response.data.data;
  },

  // ==========================================================
  // CREATE TASK
  // POST /tasks
  // ==========================================================

  async createTask(data: CreateTaskPayload): Promise<Task> {
    const response = await api.post<TaskResponse>("/tasks", data);

    return response.data.data;
  },

  // ==========================================================
  // UPDATE TASK
  // PUT /tasks/:id
  // ==========================================================

  async updateTask(taskId: string, data: UpdateTaskPayload): Promise<Task> {
    if (!taskId) {
      throw new Error("Task ID is required.");
    }

    const response = await api.put<TaskResponse>(`/tasks/${taskId}`, data);

    return response.data.data;
  },

  // ==========================================================
  // DELETE TASK
  // DELETE /tasks/:id
  // ==========================================================

  async deleteTask(taskId: string): Promise<void> {
    if (!taskId) {
      throw new Error("Task ID is required.");
    }

    await api.delete(`/tasks/${taskId}`);
  },

  // ==========================================================
  // UPDATE STATUS
  // PATCH /tasks/:id/status
  // ==========================================================

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    if (!taskId) {
      throw new Error("Task ID is required.");
    }

    const response = await api.patch<TaskResponse>(`/tasks/${taskId}/status`, {
      status,
    });

    return response.data.data;
  },

  // ==========================================================
  // KANBAN
  // GET /tasks/project/:projectId/kanban
  // ==========================================================

  async getKanban(projectId: string): Promise<KanbanResponse["data"]> {
    if (!projectId) {
      throw new Error("Project ID is required.");
    }

    const response = await api.get<KanbanResponse>(
      `/tasks/project/${projectId}/kanban`,
    );

    return response.data.data;
  },

  // ==========================================================
  // ADD COMMENT
  // POST /tasks/:id/comments
  // ==========================================================

  async addTaskComment(taskId: string, text: string): Promise<TaskComment> {
    if (!taskId) {
      throw new Error("Task ID is required.");
    }

    const cleanText = text.trim();

    if (!cleanText) {
      throw new Error("Comment text is required.");
    }

    const response = await api.post<{
      success: boolean;
      message?: string;
      data: TaskComment;
    }>(`/tasks/${taskId}/comments`, {
      text: cleanText,
    });

    return response.data.data;
  },

  // ==========================================================
  // GET COMMENTS
  // GET /tasks/:id/comments
  // ==========================================================

  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    if (!taskId) {
      throw new Error("Task ID is required.");
    }

    const response = await api.get<TaskCommentsResponse>(
      `/tasks/${taskId}/comments`,
    );

    return Array.isArray(response.data?.data) ? response.data.data : [];
  },

  // ==========================================================
  // DELETE COMMENT
  // DELETE /tasks/:taskId/comments/:commentId
  // ==========================================================

  async deleteTaskComment(taskId: string, commentId: string): Promise<void> {
    if (!taskId) {
      throw new Error("Task ID is required.");
    }

    if (!commentId) {
      throw new Error("Comment ID is required.");
    }

    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  // ==========================================================
  // AI PRIORITIZE
  // PATCH /tasks/:id/ai-prioritize
  // ==========================================================

  async autoPrioritizeTask(taskId: string): Promise<Task> {
    if (!taskId) {
      throw new Error("Task ID is required.");
    }

    const response = await api.patch<TaskResponse>(
      `/tasks/${taskId}/ai-prioritize`,
    );

    return response.data.data;
  },
};

export default taskService;
