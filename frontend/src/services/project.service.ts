import api from "../services/api";

import type {
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "../types/project.types";

const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get("/projects");

    return response.data;
  },

  async getProjectById(
    projectId: string,
  ): Promise<Project> {
    const response = await api.get(
      `/projects/${projectId}`,
    );

    return response.data;
  },

  async createProject(
    data: CreateProjectPayload,
  ): Promise<Project> {
    const response = await api.post(
      "/projects",
      data,
    );

    return response.data;
  },

  async updateProject(
    projectId: string,
    data: UpdateProjectPayload,
  ): Promise<Project> {
    const response = await api.put(
      `/projects/${projectId}`,
      data,
    );

    return response.data;
  },

  async deleteProject(
    projectId: string,
  ): Promise<void> {
    await api.delete(
      `/projects/${projectId}`,
    );
  },
};

export default projectService;