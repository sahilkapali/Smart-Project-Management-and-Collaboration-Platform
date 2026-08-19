import api from "./api";

import type {
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "../types/project.types";

/* ============================================================
   BACKEND PROJECT TYPES
   ============================================================ */

interface BackendProject extends Omit<Project, "id"> {
  _id?: string;

  id?: string;

  progress?: number;

  endDate?: string | null;

  dueDate?: string | null;
}

/* ============================================================
   HELPERS
   ============================================================ */

/**
 * Extract MongoDB/User IDs safely
 */
const getId = (value: unknown): string => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value !== null) {
    const object = value as {
      _id?: string;
      id?: string;
    };

    return object._id ?? object.id ?? "";
  }

  return "";
};

/**
 * Normalize backend project
 * into frontend Project format
 */
const normalizeProject = (project: BackendProject): Project => {
  return {
    id: project.id ?? project._id ?? "",

    name: project.name ?? "",

    description: project.description ?? null,

    team: project.team ?? "",

    teamId:
      typeof project.team === "object" && project.team !== null
        ? getId(project.team)
        : (project.teamId ?? ""),

    createdBy: getId(project.createdBy),

    members: Array.isArray(project.members)
      ? project.members.map((member) => getId(member))
      : [],

    status: project.status,

    progress: project.progress ?? 0,

    startDate: project.startDate ?? null,

    endDate: project.endDate ?? project.dueDate ?? null,

    dueDate: project.dueDate ?? project.endDate ?? null,

    createdAt: project.createdAt ?? "",

    updatedAt: project.updatedAt ?? "",
  };
};

/**
 * Extract API response safely
 */
const extractData = <T>(response: unknown): T => {
  const axiosResponse = response as {
    data?: unknown;
  };

  const body = axiosResponse.data;

  if (typeof body === "object" && body !== null && "data" in body) {
    return (
      body as {
        data: T;
      }
    ).data;
  }

  return body as T;
};

/* ============================================================
   PROJECT SERVICE
   ============================================================ */

const projectService = {
  /**
   * GET ALL PROJECTS
   */
  async getProjects(): Promise<Project[]> {
    const response = await api.get("/projects");

    const rawData = extractData<
      | BackendProject[]
      | {
          projects?: BackendProject[];
        }
    >(response);

    const projects = Array.isArray(rawData)
      ? rawData
      : (rawData.projects ?? []);

    return projects
      .map(normalizeProject)
      .filter((project) => Boolean(project.id));
  },

  /**
   * GET PROJECT BY ID
   */
  async getProjectById(projectId: string): Promise<Project> {
    if (!projectId) {
      throw new Error("Project ID is required.");
    }

    const response = await api.get(`/projects/${projectId}`);

    const project = extractData<BackendProject>(response);

    return normalizeProject(project);
  },

  /**
   * CREATE PROJECT
   */
  async createProject(data: CreateProjectPayload): Promise<Project> {
    const response = await api.post("/projects", data);

    const project = extractData<BackendProject>(response);

    return normalizeProject(project);
  },

  /**
   * UPDATE PROJECT
   */
  async updateProject(
    projectId: string,
    data: UpdateProjectPayload,
  ): Promise<Project> {
    if (!projectId) {
      throw new Error("Project ID is required.");
    }

    const response = await api.put(`/projects/${projectId}`, data);

    const project = extractData<BackendProject>(response);

    return normalizeProject(project);
  },

  /**
   * DELETE PROJECT
   */
  async deleteProject(projectId: string): Promise<void> {
    if (!projectId) {
      throw new Error("Project ID is required.");
    }

    await api.delete(`/projects/${projectId}`);
  },
};

export default projectService;
