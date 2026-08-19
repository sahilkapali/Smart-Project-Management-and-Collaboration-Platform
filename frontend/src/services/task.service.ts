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

// ============================================================
// AI PROJECT PRIORITIZATION RESPONSE
// ============================================================

export interface AutoPrioritizeProjectTasksResponse {
  tasks: Task[];
  message: string;
  success?: boolean;
}

// ============================================================
// TASK SERVICE
// ============================================================

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
  // GET SINGLE TASK
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
    if (!data.project) {
      throw new Error("Project ID is required.");
    }

    if (!data.title?.trim()) {
      throw new Error("Task title is required.");
    }

    const response = await api.post<TaskResponse>("/tasks", {
      ...data,
      title: data.title.trim(),
    });

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
  // UPDATE TASK STATUS
  // PATCH /tasks/:id/status
  // ==========================================================

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    if (!taskId) {
      throw new Error("Task ID is required.");
    }

    if (!status) {
      throw new Error("Task status is required.");
    }

    const response = await api.patch<TaskResponse>(`/tasks/${taskId}/status`, {
      status,
    });

    return response.data.data;
  },

  // ==========================================================
  // GET KANBAN
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
  // AI PROJECT-WIDE AUTO PRIORITIZATION
  //
  // BACKEND ROUTE:
  //
  // PATCH /api/tasks/project/:projectId/ai-prioritize
  //
  // IMPORTANT:
  // This prioritizes ALL tasks belonging to the project.
  //
  // The project ID is NOT a task ID.
  // ==========================================================

  async autoPrioritizeProjectTasks(
    projectId: string,
  ): Promise<AutoPrioritizeProjectTasksResponse> {
    if (!projectId?.trim()) {
      throw new Error("Project ID is required.");
    }

    // --------------------------------------------------------
    // Call backend AI prioritization endpoint
    // --------------------------------------------------------

    const response = await api.patch<{
      success?: boolean;
      message?: string;
      data?:
        | Task[]
        | {
            tasks?: Task[];
            message?: string;
          };
    }>(`/tasks/project/${projectId}/ai-prioritize`);

    const responseData = response.data;

    // --------------------------------------------------------
    // Backend normally returns:
    //
    // {
    //   success: true,
    //   message: "...",
    //   count: 2,
    //   data: [
    //     {
    //       _id: "...",
    //       priority: "High"
    //     },
    //     {
    //       _id: "...",
    //       priority: "Critical"
    //     }
    //   ]
    // }
    //
    // Therefore data should normally be an array.
    // --------------------------------------------------------

    if (Array.isArray(responseData?.data)) {
      return {
        success: responseData.success,
        message:
          responseData.message ??
          "AI successfully prioritized the project tasks.",
        tasks: responseData.data,
      };
    }

    // --------------------------------------------------------
    // Compatibility:
    //
    // Some backend implementations may return:
    //
    // {
    //   success: true,
    //   message: "...",
    //   data: {
    //     tasks: [...]
    //   }
    // }
    // --------------------------------------------------------

    if (
      responseData?.data &&
      typeof responseData.data === "object" &&
      !Array.isArray(responseData.data) &&
      Array.isArray(responseData.data.tasks)
    ) {
      return {
        success: responseData.success,
        message:
          responseData.message ??
          responseData.data.message ??
          "AI successfully prioritized the project tasks.",
        tasks: responseData.data.tasks,
      };
    }

    // --------------------------------------------------------
    // Backend completed but did not return tasks.
    //
    // Fetch them again so the frontend receives the current
    // MongoDB priorities.
    // --------------------------------------------------------

    try {
      const refreshedTasks = await this.getTasks(projectId);

      return {
        success: responseData?.success,
        message:
          responseData?.message ?? "AI prioritization completed successfully.",
        tasks: refreshedTasks,
      };
    } catch {
      return {
        success: responseData?.success,
        message:
          responseData?.message ?? "AI prioritization completed successfully.",
        tasks: [],
      };
    }
  },
};

export default taskService;
