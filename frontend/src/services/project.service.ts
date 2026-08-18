import api from "./api";

import type {
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "../types/project.types";

/* ============================================================
   BACKEND PROJECT
============================================================ */

interface BackendProject extends Omit<Project, "id"> {
  id?: string;
  _id?: string;

  progress?: number;

  members?: unknown[];

  createdBy?: unknown;
}

/* ============================================================
   NORMALIZE PROJECT
============================================================ */

const normalizeProject = (project: BackendProject): Project => {
  return {
    id: project.id ?? project._id ?? "",

    name: project.name,

    description: project.description ?? null,

    status: project.status,

    progress: project.progress ?? 0,

    startDate: project.startDate ?? null,

    endDate: project.endDate ?? null,

    teamId: project.teamId ?? null,

    members: project.members ?? [],

    createdBy: project.createdBy,

    createdAt: project.createdAt,

    updatedAt: project.updatedAt,
  };
};

/* ============================================================
   PROJECT SERVICE
============================================================ */

const projectService = {
  /* ==========================================================
     GET CURRENT USER PROJECTS
     
     IMPORTANT:
     The backend decides which projects the user is allowed
     to see according to their role.
  ========================================================== */

  async getProjects(): Promise<Project[]> {
    const response = await api.get("/projects");

    const rawData = response.data;

    const projectsData = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData?.projects)
          ? rawData.projects
          : [];

    return projectsData
      .map((project: BackendProject) => normalizeProject(project))
      .filter((project: Project) => Boolean(project.id));
  },

  /* ==========================================================
     GET PROJECT BY ID
  ========================================================== */

  async getProjectById(projectId: string): Promise<Project> {
    if (!projectId) {
      throw new Error("Project ID is required.");
    }

    const response = await api.get(`/projects/${projectId}`);

    const rawData = response.data;

    const project =
      rawData?.data ??
      rawData?.project ??
      rawData;

    return normalizeProject(project);
  },

  /* ==========================================================
     CREATE PROJECT
  ========================================================== */

  async createProject(
    data: CreateProjectPayload,
  ): Promise<Project> {
    const response = await api.post("/projects", data);

    const rawData = response.data;

    const project =
      rawData?.data ??
      rawData?.project ??
      rawData;

    return normalizeProject(project);
  },

  /* ==========================================================
     UPDATE PROJECT
  ========================================================== */

  async updateProject(
    projectId: string,
    data: UpdateProjectPayload,
  ): Promise<Project> {
    if (!projectId) {
      throw new Error("Project ID is required.");
    }

    const response = await api.put(
      `/projects/${projectId}`,
      data,
    );

    const rawData = response.data;

    const project =
      rawData?.data ??
      rawData?.project ??
      rawData;

    return normalizeProject(project);
  },

  /* ==========================================================
     DELETE PROJECT
  ========================================================== */

  async deleteProject(projectId: string): Promise<void> {
    if (!projectId) {
      throw new Error("Project ID is required.");
    }

    await api.delete(`/projects/${projectId}`);
  },
};

export default projectService;