import api from "./api";

import type {
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "../types/project.types";

const projectService = {
  /**
   * Get projects accessible to the current user.
   *
   * The backend should return only projects where the
   * current user is:
   *
   * - creator
   * - project manager
   * - team member
   */
  async getProjects(): Promise<Project[]> {
    const response = await api.get("/projects");

    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.projects)) {
      return data.projects;
    }

    return [];
  },

  /**
   * Get one specific project.
   *
   * The backend is responsible for checking whether
   * the authenticated user has access to this project.
   */
  async getProjectById(
    projectId: string,
  ): Promise<Project> {
    if (!projectId) {
      throw new Error("Project ID is required.");
    }

    const response = await api.get(
      `/projects/${projectId}`,
    );

    const data = response.data;

    return (
      data?.data ||
      data?.project ||
      data
    );
  },

  /**
   * Create project
   */
  async createProject(
    data: CreateProjectPayload,
  ): Promise<Project> {
    const response = await api.post(
      "/projects",
      data,
    );

    const responseData = response.data;

    return (
      responseData?.data ||
      responseData?.project ||
      responseData
    );
  },

  /**
   * Update project
   */
  async updateProject(
    projectId: string,
    data: UpdateProjectPayload,
  ): Promise<Project> {
    if (!projectId) {
      throw new Error(
        "Project ID is required.",
      );
    }

    const response = await api.put(
      `/projects/${projectId}`,
      data,
    );

    const responseData = response.data;

    return (
      responseData?.data ||
      responseData?.project ||
      responseData
    );
  },

  /**
   * Delete project
   */
  async deleteProject(
    projectId: string,
  ): Promise<void> {
    if (!projectId) {
      throw new Error(
        "Project ID is required.",
      );
    }

    await api.delete(
      `/projects/${projectId}`,
    );
  },
};

export default projectService;