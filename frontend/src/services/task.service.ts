import api from "./api";

import type {
  CreateTaskPayload,
  Task,
  TaskStatus,
  UpdateTaskPayload,
} from "../types/task.types";


/* =========================================================
   RESPONSE HELPER
========================================================= */

const unwrap = <T>(
  response: any,
): T => {

  const body =
    response?.data;

  return (
    body?.data ??
    body?.tasks ??
    body
  ) as T;
};


/* =========================================================
   TASK SERVICE
========================================================= */

const taskService = {

  /**
   * =======================================================
   * GET TASKS FOR PROJECT
   *
   * Backend:
   *
   * GET /api/tasks?project=PROJECT_ID
   *
   * The backend checks whether the current user belongs
   * to this project.
   * =======================================================
   */
  async getTasks(
    projectId: string,
  ): Promise<Task[]> {

    if (!projectId) {

      throw new Error(
        "Project ID is required to load tasks.",
      );
    }


    const response =
      await api.get(
        "/tasks",
        {
          params: {
            project:
              projectId,
          },
        },
      );


    const data =
      unwrap<Task[]>(
        response,
      );


    return Array.isArray(
      data,
    )
      ? data
      : [];
  },


  /**
   * =======================================================
   * GET SINGLE TASK
   * =======================================================
   */
  async getTaskById(
    taskId: string,
  ): Promise<Task> {

    if (!taskId) {

      throw new Error(
        "Task ID is required.",
      );
    }


    const response =
      await api.get(
        `/tasks/${taskId}`,
      );


    return unwrap<Task>(
      response,
    );
  },


  /**
   * =======================================================
   * CREATE TASK
   * =======================================================
   */
  async createTask(
    data: CreateTaskPayload,
  ): Promise<Task> {

    if (!data.project) {

      throw new Error(
        "Project ID is required to create a task.",
      );
    }


    const response =
      await api.post(
        "/tasks",
        data,
      );


    return unwrap<Task>(
      response,
    );
  },


  /**
   * =======================================================
   * UPDATE TASK
   * =======================================================
   */
  async updateTask(
    taskId: string,
    data: UpdateTaskPayload,
  ): Promise<Task> {

    if (!taskId) {

      throw new Error(
        "Task ID is required.",
      );
    }


    const response =
      await api.put(
        `/tasks/${taskId}`,
        data,
      );


    return unwrap<Task>(
      response,
    );
  },


  /**
   * =======================================================
   * DELETE TASK
   * =======================================================
   */
  async deleteTask(
    taskId: string,
  ): Promise<void> {

    if (!taskId) {

      throw new Error(
        "Task ID is required.",
      );
    }


    await api.delete(
      `/tasks/${taskId}`,
    );
  },


  /**
   * =======================================================
   * UPDATE TASK STATUS
   * =======================================================
   */
  async updateStatus(
    taskId: string,
    status: TaskStatus,
  ): Promise<Task> {

    if (!taskId) {

      throw new Error(
        "Task ID is required.",
      );
    }


    const response =
      await api.patch(
        `/tasks/${taskId}/status`,
        {
          status,
        },
      );


    return unwrap<Task>(
      response,
    );
  },


  /**
   * =======================================================
   * GET KANBAN
   * =======================================================
   */
  async getKanban(
    projectId: string,
  ) {

    if (!projectId) {

      throw new Error(
        "Project ID is required.",
      );
    }


    const response =
      await api.get(
        `/tasks/project/${projectId}/kanban`,
      );


    return unwrap(
      response,
    );
  },


  /**
   * =======================================================
   * AI PRIORITIZATION
   * =======================================================
   */
  async autoPrioritize(
    taskId: string,
  ): Promise<Task> {

    if (!taskId) {

      throw new Error(
        "Task ID is required.",
      );
    }


    const response =
      await api.patch(
        `/tasks/${taskId}/ai-prioritize`,
      );


    return unwrap<Task>(
      response,
    );
  },
};


export default taskService;