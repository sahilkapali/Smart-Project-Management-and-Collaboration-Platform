import api from "./api";

import type {
  Repository,
  FileNode,
  RepositoryIssue,
  RepositoryVersion,
  CreateVersionPayload,
} from "../types/repository.types";

const ENDPOINT = "/repositories";

// ============================================================
// API RESPONSE TYPES
// ============================================================

interface RepositoryResponse {
  success: boolean;
  message?: string;
  data: Repository;
}

interface RepositoriesResponse {
  success: boolean;
  message?: string;
  data: Repository[];
}

interface DeleteRepositoryResponse {
  success: boolean;
  message: string;
}

// ============================================================
// GET ALL ACCESSIBLE REPOSITORIES
// ============================================================
//
// Backend:
// GET /api/repositories
//
// Accessible to:
// - ADMIN
// - Project owner
// - Project members
//

export const getRepositories = async (): Promise<Repository[]> => {
  const response = await api.get<RepositoriesResponse>(ENDPOINT);

  return response.data.data;
};

// ============================================================
// GET REPOSITORIES BY PROJECT
// ============================================================
//
// Backend:
// GET /api/repositories/project/:projectId
//

export const getProjectRepositories = async (
  projectId: string,
): Promise<Repository[]> => {
  const response = await api.get<RepositoriesResponse>(
    `${ENDPOINT}/project/${projectId}`,
  );

  return response.data.data;
};

// ============================================================
// GET SINGLE REPOSITORY
// ============================================================
//
// Backend:
// GET /api/repositories/:id
//

export const getRepositoryById = async (
  repositoryId: string,
): Promise<Repository> => {
  const response = await api.get<RepositoryResponse>(
    `${ENDPOINT}/${repositoryId}`,
  );

  return response.data.data;
};

// ============================================================
// CREATE REPOSITORY
// ============================================================
//
// Backend:
// POST /api/repositories
//
// Backend expects:
// {
//   project: string;
//   name: string;
//   description?: string;
//   githubUrl?: string;
// }
//
// Only ADMIN / PROJECT_MANAGER with project access
// should be allowed by backend.
//

export interface CreateRepositoryPayload {
  project: string;
  name: string;
  description?: string;
  githubUrl?: string;
}

export const createRepository = async (
  data: CreateRepositoryPayload,
): Promise<Repository> => {
  const response = await api.post<RepositoryResponse>(ENDPOINT, data);

  return response.data.data;
};

// ============================================================
// UPDATE REPOSITORY
// ============================================================
//
// Backend:
// PATCH /api/repositories/:id
//
// Backend expects:
// {
//   name?: string;
//   description?: string;
//   githubUrl?: string;
// }
//

export interface UpdateRepositoryPayload {
  name?: string;
  description?: string;
  githubUrl?: string;
}

export const updateRepository = async (
  repositoryId: string,
  data: UpdateRepositoryPayload,
): Promise<Repository> => {
  const response = await api.patch<RepositoryResponse>(
    `${ENDPOINT}/${repositoryId}`,
    data,
  );

  return response.data.data;
};

// ============================================================
// DELETE REPOSITORY
// ============================================================
//
// Backend:
// DELETE /api/repositories/:id
//

export const deleteRepository = async (
  repositoryId: string,
): Promise<string> => {
  const response = await api.delete<DeleteRepositoryResponse>(
    `${ENDPOINT}/${repositoryId}`,
  );

  return response.data.message;
};

// ============================================================
// OPTIONAL: REPOSITORY VERSIONS
// ============================================================
//
// Keep these only if you have separate backend routes:
//
// POST /api/repositories/:id/versions
// GET  /api/repositories/:id/versions
//
// They are NOT present in the repository.routes.ts
// you showed me.
//

export const uploadRepositoryVersion = async (
  repositoryId: string,
  formData: FormData,
): Promise<RepositoryVersion> => {
  const response = await api.post<
    RepositoryResponse & {
      data: RepositoryVersion;
    }
  >(`${ENDPOINT}/${repositoryId}/versions`, formData);

  return response.data.data;
};

export const getRepositoryVersions = async (
  repositoryId: string,
): Promise<RepositoryVersion[]> => {
  const response = await api.get<{
    success: boolean;
    message?: string;
    data: RepositoryVersion[];
  }>(`${ENDPOINT}/${repositoryId}/versions`);

  return response.data.data;
};

export const createRepositoryVersion = async (
  repositoryId: string,
  payload: CreateVersionPayload,
): Promise<RepositoryVersion> => {
  const formData = new FormData();

  formData.append("versionNumber", payload.versionNumber);

  if (payload.title) {
    formData.append("title", payload.title);
  }

  if (payload.changelog) {
    formData.append("changelog", payload.changelog);
  }

  if (payload.commitHash) {
    formData.append("commitHash", payload.commitHash);
  }

  if (payload.file) {
    formData.append("file", payload.file);
  }

  return uploadRepositoryVersion(repositoryId, formData);
};

// ============================================================
// OPTIONAL: REPOSITORY FILES
// ============================================================
//
// Keep only if backend provides:
// GET /api/repositories/:id/files
//

export const getRepositoryFiles = async (
  repositoryId: string,
  path = "",
): Promise<FileNode[]> => {
  const url = path
    ? `${ENDPOINT}/${repositoryId}/files?path=${encodeURIComponent(path)}`
    : `${ENDPOINT}/${repositoryId}/files`;

  const response = await api.get<{
    success: boolean;
    message?: string;
    data: FileNode[];
  }>(url);

  return response.data.data;
};

// ============================================================
// OPTIONAL: REPOSITORY ISSUES
// ============================================================
//
// Keep only if backend provides:
// GET /api/repositories/:id/issues
//

export const getRepositoryIssues = async (
  repositoryId: string,
): Promise<RepositoryIssue[]> => {
  const response = await api.get<{
    success: boolean;
    message?: string;
    data: RepositoryIssue[];
  }>(`${ENDPOINT}/${repositoryId}/issues`);

  return response.data.data;
};
