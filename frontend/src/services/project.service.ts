import api from "./api";

import type {
  Project,
  ProjectStatus,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectTeam,
} from "../types/project.types";

// ============================================================
// BACKEND TYPES
// ============================================================

interface BackendTeam {
  _id?: string;
  id?: string;
  name?: string | null;
}

interface BackendUser {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

interface BackendProject {
  _id?: string;
  id?: string;

  name?: string;

  description?: string | null;

  team?: string | BackendTeam | null;

  teamId?: string | null;

  teamName?: string | null;

  createdBy?: string | BackendUser | null;

  members?: Array<string | BackendUser>;

  status?: ProjectStatus;

  startDate?: string | null;

  dueDate?: string | null;

  createdAt?: string;

  updatedAt?: string;
}

// ============================================================
// HELPERS
// ============================================================

const getId = (
  value?: string | { _id?: string; id?: string } | null,
): string => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value._id ?? value.id ?? "";
};

// ============================================================
// GET TEAM ID
// ============================================================

const getTeamId = (project: BackendProject): string => {
  // ----------------------------------------------------------
  // Backend explicitly returned teamId
  // ----------------------------------------------------------

  if (project.teamId) {
    return project.teamId;
  }

  // ----------------------------------------------------------
  // Backend returned team as ObjectId string
  // ----------------------------------------------------------

  if (typeof project.team === "string") {
    return project.team;
  }

  // ----------------------------------------------------------
  // Backend returned populated team object
  // ----------------------------------------------------------

  if (project.team && typeof project.team === "object") {
    return project.team._id ?? project.team.id ?? "";
  }

  return "";
};

// ============================================================
// GET TEAM NAME
// ============================================================

const getTeamName = (project: BackendProject): string => {
  // ----------------------------------------------------------
  // 1. Prefer teamName directly from backend
  // ----------------------------------------------------------

  if (
    typeof project.teamName === "string" &&
    project.teamName.trim().length > 0
  ) {
    return project.teamName.trim();
  }

  // ----------------------------------------------------------
  // 2. Use populated team.name
  // ----------------------------------------------------------

  if (
    project.team &&
    typeof project.team === "object" &&
    typeof project.team.name === "string" &&
    project.team.name.trim().length > 0
  ) {
    return project.team.name.trim();
  }

  // ----------------------------------------------------------
  // 3. No team name available
  // ----------------------------------------------------------

  return "No team assigned";
};

// ============================================================
// NORMALIZE TEAM
// ============================================================

const normalizeTeam = (project: BackendProject): ProjectTeam => {
  const teamId = getTeamId(project);

  const teamName = getTeamName(project);

  // ----------------------------------------------------------
  // Backend returned populated team
  // ----------------------------------------------------------

  if (project.team && typeof project.team === "object") {
    return {
      ...project.team,

      _id: project.team._id ?? project.team.id ?? teamId,

      name: project.team.name?.trim() || teamName,
    };
  }

  // ----------------------------------------------------------
  // Backend returned only team ID
  // ----------------------------------------------------------

  return {
    _id: teamId,
    name: teamName,
  };
};

// ============================================================
// NORMALIZE PROJECT
// ============================================================

const normalizeProject = (data: BackendProject): Project => {
  const teamId = getTeamId(data);

  const team = normalizeTeam(data);

  return {
    id: data._id ?? data.id ?? "",

    name: data.name ?? "",

    description: data.description ?? null,

    // Keep populated team object.
    team,

    // Keep teamId for existing frontend code.
    teamId,

    createdBy: getId(data.createdBy),

    members: (data.members ?? []).map((member) => getId(member)),

    status: data.status ?? "PLANNING",

    startDate: data.startDate ?? null,

    dueDate: data.dueDate ?? null,

    createdAt: data.createdAt ?? "",

    updatedAt: data.updatedAt ?? "",
  };
};

// ============================================================
// EXTRACT RESPONSE DATA
// ============================================================

const extractData = <T>(response: unknown): T => {
  const result = response as {
    data?: T | { data?: T };
  };

  if (
    result &&
    result.data &&
    typeof result.data === "object" &&
    "data" in result.data
  ) {
    return (result.data as { data?: T }).data as T;
  }

  return result.data as T;
};

// ============================================================
// CREATE PROJECT
// ============================================================

export const createProject = async (
  payload: CreateProjectPayload,
): Promise<Project> => {
  const response = await api.post("/projects", payload);

  const data = extractData<BackendProject>(response);

  return normalizeProject(data);
};

// ============================================================
// GET PROJECTS
// ============================================================

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get("/projects");

  const data = extractData<BackendProject[]>(response);

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((project) => normalizeProject(project));
};

// ============================================================
// GET PROJECT BY ID
// ============================================================

export const getProjectById = async (projectId: string): Promise<Project> => {
  const response = await api.get(`/projects/${projectId}`);

  const data = extractData<BackendProject>(response);

  return normalizeProject(data);
};

// ============================================================
// UPDATE PROJECT
// ============================================================

export const updateProject = async (
  projectId: string,
  payload: UpdateProjectPayload,
): Promise<Project> => {
  const response = await api.put(`/projects/${projectId}`, payload);

  const data = extractData<BackendProject>(response);

  return normalizeProject(data);
};

// ============================================================
// DELETE PROJECT
// ============================================================

export const deleteProject = async (projectId: string): Promise<boolean> => {
  await api.delete(`/projects/${projectId}`);

  return true;
};

// ============================================================
// ADD PROJECT MEMBER
// ============================================================

export const addProjectMember = async (
  projectId: string,
  email: string,
): Promise<Project> => {
  const response = await api.post(`/projects/${projectId}/members`, {
    email,
  });

  const data = extractData<BackendProject>(response);

  return normalizeProject(data);
};

// ============================================================
// DEFAULT PROJECT SERVICE
// ============================================================

const projectService = {
  createProject,

  getProjects,

  getProjectById,

  updateProject,

  deleteProject,

  addProjectMember,
};

export default projectService;
