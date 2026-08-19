import api from "./api";

import type {
  CreateRepositoryFileRequest,
  CreateRepositoryRequest,
  CreateRepositoryVersionRequest,
  Repository,
  RepositoryFile,
  RepositoryIssue,
  RepositoryStatistics,
  RepositoryVersion,
  UpdateRepositoryFileRequest,
  UpdateRepositoryRequest,
} from "../types/repository.types";

// Helper to safely extract response data across different Axios interceptor configurations
const extractData = <T>(response: any): T => {
  return response.data?.data ?? response.data;
};

// ============================================================
// REPOSITORY ENDPOINTS (/api/repositories)
// ============================================================

export const createRepository = async (
  data: CreateRepositoryRequest,
): Promise<Repository> => {
  const response = await api.post("/repositories", data);
  return extractData<Repository>(response);
};

export const getRepositories = async (): Promise<Repository[]> => {
  const response = await api.get("/repositories");
  const data = extractData<Repository[]>(response);
  return Array.isArray(data) ? data : [];
};

export const getProjectRepositories = async (
  projectId: string,
): Promise<Repository[]> => {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  const response = await api.get(
    `/repositories/project/${encodeURIComponent(projectId)}`,
  );
  const data = extractData<Repository[]>(response);
  return Array.isArray(data) ? data : [];
};

export const getRepository = async (
  repositoryId: string,
): Promise<Repository> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }

  const response = await api.get(
    `/repositories/${encodeURIComponent(repositoryId)}`,
  );
  return extractData<Repository>(response);
};

export const getRepositoryById = getRepository;

export const updateRepository = async (
  repositoryId: string,
  data: UpdateRepositoryRequest,
): Promise<Repository> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }

  const response = await api.put(
    `/repositories/${encodeURIComponent(repositoryId)}`,
    data,
  );
  return extractData<Repository>(response);
};

export const deleteRepository = async (repositoryId: string): Promise<void> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }

  await api.delete(`/repositories/${encodeURIComponent(repositoryId)}`);
};

// ============================================================
// REPOSITORY VERSION ENDPOINTS (/api/repositories/:id/versions)
// ============================================================

export const createRepositoryVersion = async (
  repositoryId: string,
  data: Omit<CreateRepositoryVersionRequest, "repositoryId">,
): Promise<RepositoryVersion> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }
  if (!data.versionNumber?.trim()) {
    throw new Error("Version number is required.");
  }
  if (!data.title?.trim()) {
    throw new Error("Version title is required.");
  }

  const formData = new FormData();
  formData.append("versionNumber", data.versionNumber.trim());
  formData.append("title", data.title.trim());

  if (data.changelog?.trim()) {
    formData.append("changelog", data.changelog.trim());
  }
  if (data.commitHash?.trim()) {
    formData.append("commitHash", data.commitHash.trim());
  }
  if (data.file) {
    formData.append("file", data.file);
  }

  // Axios automatically sets content-type with multi-part boundary when passed FormData
  const response = await api.post(
    `/repositories/${encodeURIComponent(repositoryId)}/versions`,
    formData,
  );

  return extractData<RepositoryVersion>(response);
};

export const getRepositoryVersions = async (
  repositoryId: string,
): Promise<RepositoryVersion[]> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }

  const response = await api.get(
    `/repositories/${encodeURIComponent(repositoryId)}/versions`,
  );
  const data = extractData<RepositoryVersion[]>(response);
  return Array.isArray(data) ? data : [];
};

export const getRepositoryVersion = async (
  repositoryId: string,
  versionId: string,
): Promise<RepositoryVersion> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }
  if (!versionId) {
    throw new Error("Version ID is required.");
  }

  const response = await api.get(
    `/repositories/${encodeURIComponent(repositoryId)}/versions/${encodeURIComponent(versionId)}`,
  );
  return extractData<RepositoryVersion>(response);
};

export const deleteRepositoryVersion = async (
  repositoryId: string,
  versionId: string,
): Promise<void> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }
  if (!versionId) {
    throw new Error("Version ID is required.");
  }

  await api.delete(
    `/repositories/${encodeURIComponent(repositoryId)}/versions/${encodeURIComponent(versionId)}`,
  );
};

// ============================================================
// REPOSITORY FILE ENDPOINTS (/api/repository-files)
// ============================================================

export const getRepositoryFiles = async (
  repositoryId: string,
  versionId?: string,
): Promise<RepositoryFile[]> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }

  const response = await api.get(
    `/repository-files/repository/${encodeURIComponent(repositoryId)}`,
    {
      params: versionId ? { versionId } : undefined,
    },
  );

  const data = extractData<RepositoryFile[]>(response);
  return Array.isArray(data) ? data : [];
};

export const getRepositoryFileContent = async (
  fileId: string,
): Promise<RepositoryFile> => {
  if (!fileId) {
    throw new Error("File ID is required.");
  }

  const response = await api.get(
    `/repository-files/${encodeURIComponent(fileId)}`,
  );
  return extractData<RepositoryFile>(response);
};

export const createRepositoryFile = async (
  data: CreateRepositoryFileRequest,
): Promise<RepositoryFile> => {
  const response = await api.post("/repository-files", data);
  return extractData<RepositoryFile>(response);
};

export const updateRepositoryFile = async (
  fileId: string,
  data: UpdateRepositoryFileRequest,
): Promise<RepositoryFile> => {
  if (!fileId) {
    throw new Error("File ID is required.");
  }

  const response = await api.put(
    `/repository-files/${encodeURIComponent(fileId)}`,
    data,
  );
  return extractData<RepositoryFile>(response);
};

export const deleteRepositoryFile = async (fileId: string): Promise<void> => {
  if (!fileId) {
    throw new Error("File ID is required.");
  }

  await api.delete(`/repository-files/${encodeURIComponent(fileId)}`);
};

// ============================================================
// PLACEHOLDERS / EXPANSIONS
// ============================================================

export const getRepositoryIssues = async (
  repositoryId: string,
): Promise<RepositoryIssue[]> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }

  const response = await api.get(
    `/repositories/${encodeURIComponent(repositoryId)}/issues`,
  );
  const data = extractData<RepositoryIssue[]>(response);
  return Array.isArray(data) ? data : [];
};

export const getRepositoryStats = async (
  repositoryId: string,
): Promise<RepositoryStatistics> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }

  const response = await api.get(
    `/repositories/${encodeURIComponent(repositoryId)}/stats`,
  );
  return extractData<RepositoryStatistics>(response);
};
