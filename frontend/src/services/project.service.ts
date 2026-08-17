import api from "../services/api";

import type {
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "../types/project.types";

/**
 * Backend MongoDB documents may contain _id.
 * Frontend uses id consistently.
 */
interface BackendProject extends Omit<Project, "id"> {
  id?: string;
  _id?: string;
}

const normalizeProject = (project: BackendProject): Project => {
  return {
    id: project.id ?? project._id ?? "",
    name: project.name,
    description: project.description ?? null,
    status: project.status,
    startDate: project.startDate ?? null,
    endDate: project.endDate ?? null,
    teamId: project.teamId ?? null,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
};

const projectService = {
  // ============================================================
  // GET ALL PROJECTS
  // ============================================================

  async getProjects(): Promise<Project[]> {
    const response = await api.get("/projects");

    const rawData = response.data;

    /**
     * Support different backend response formats:
     *
     * 1. [ ... ]
     * 2. { data: [ ... ] }
     * 3. { projects: [ ... ] }
     */

    const projectsData = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData?.projects)
          ? rawData.projects
          : [];

    return projectsData.map((project: BackendProject) =>
      normalizeProject(project),
    );
  },

  // ============================================================
  // GET PROJECT BY ID
  // ============================================================

  async getProjectById(projectId: string): Promise<Project> {
    const response = await api.get(`/projects/${projectId}`);

    const rawData = response.data;

    const project = rawData?.data ?? rawData?.project ?? rawData;

    return normalizeProject(project);
  },

  // ============================================================
  // CREATE PROJECT
  // ============================================================

  async createProject(data: CreateProjectPayload): Promise<Project> {
    const response = await api.post("/projects", data);

    const rawData = response.data;

    const project = rawData?.data ?? rawData?.project ?? rawData;

    return normalizeProject(project);
  },

  // ============================================================
  // UPDATE PROJECT
  // ============================================================

  async updateProject(
    projectId: string,
    data: UpdateProjectPayload,
  ): Promise<Project> {
    const response = await api.put(`/projects/${projectId}`, data);

    const rawData = response.data;

    const project = rawData?.data ?? rawData?.project ?? rawData;

    return normalizeProject(project);
  },

  // ============================================================
  // DELETE PROJECT
  // ============================================================

  async deleteProject(projectId: string): Promise<void> {
    await api.delete(`/projects/${projectId}`);
  },
};

export default projectService;
