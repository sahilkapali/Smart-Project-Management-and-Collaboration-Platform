import api from "./api";

import type {
  Repository,
  RepositoryVersion,
  CreateRepositoryRequest,
  UpdateRepositoryRequest,
  CreateRepositoryVersionRequest,
  RepositoryStatistics,
  RepositoryFile,
  RepositoryIssue,
} from "../types/repository.types";

/**
 * ============================================================
 * REPOSITORY SERVICE
 * ============================================================
 *
 * All repository API calls go through the shared Axios client.
 *
 * The Axios client is responsible for:
 * - Backend base URL
 * - JWT Authorization header
 * - Credentials/cookies
 * - Global 401 handling
 *
 * Backend base path:
 *
 *     /api/repositories
 */

/**
 * ============================================================
 * CREATE REPOSITORY
 * ============================================================
 *
 * POST /api/repositories
 */
export const createRepository = async (
  data: CreateRepositoryRequest,
): Promise<Repository> => {
  const response = await api.post("/repositories", data);

  return response.data?.data;
};

/**
 * ============================================================
 * GET ALL ACCESSIBLE REPOSITORIES
 * ============================================================
 *
 * GET /api/repositories
 *
 * The backend automatically limits the result according
 * to the authenticated user's project access.
 */
export const getRepositories = async (): Promise<Repository[]> => {
  const response = await api.get("/repositories");

  const data = response.data?.data;

  return Array.isArray(data) ? data : [];
};

/**
 * ============================================================
 * GET REPOSITORIES FOR A PROJECT
 * ============================================================
 *
 * GET /api/repositories/project/:projectId
 */
export const getProjectRepositories = async (
  projectId: string,
): Promise<Repository[]> => {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  const response = await api.get(
    `/repositories/project/${encodeURIComponent(projectId)}`,
  );

  const data = response.data?.data;

  return Array.isArray(data) ? data : [];
};

/**
 * ============================================================
 * GET REPOSITORY BY ID
 * ============================================================
 *
 * GET /api/repositories/:id
 */
export const getRepository = async (
  repositoryId: string,
): Promise<Repository> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }

  const response = await api.get(
    `/repositories/${encodeURIComponent(repositoryId)}`,
  );

  return response.data?.data;
};

/**
 * Backward-compatible alias.
 */
export const getRepositoryById = async (
  repositoryId: string,
): Promise<Repository> => {
  return getRepository(repositoryId);
};

/**
 * ============================================================
 * UPDATE REPOSITORY
 * ============================================================
 *
 * PUT /api/repositories/:id
 */
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

  return response.data?.data;
};

/**
 * ============================================================
 * DELETE REPOSITORY
 * ============================================================
 *
 * DELETE /api/repositories/:id
 */
export const deleteRepository = async (repositoryId: string): Promise<void> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }

  await api.delete(`/repositories/${encodeURIComponent(repositoryId)}`);
};

/**
 * ============================================================
 * CREATE REPOSITORY VERSION
 * ============================================================
 *
 * POST /api/repositories/:id/versions
 *
 * Content-Type:
 * multipart/form-data
 *
 * Fields:
 * - versionNumber
 * - title
 * - changelog
 * - commitHash
 * - file
 */
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

  const response = await api.post(
    `/repositories/${encodeURIComponent(repositoryId)}/versions`,
    formData,
  );

  return response.data?.data;
};

/**
 * ============================================================
 * GET REPOSITORY VERSIONS
 * ============================================================
 *
 * GET /api/repositories/:id/versions
 */
export const getRepositoryVersions = async (
  repositoryId: string,
): Promise<RepositoryVersion[]> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }

  const response = await api.get(
    `/repositories/${encodeURIComponent(repositoryId)}/versions`,
  );

  const data = response.data?.data;

  return Array.isArray(data) ? data : [];
};

/**
 * ============================================================
 * GET SINGLE REPOSITORY VERSION
 * ============================================================
 *
 * GET /api/repositories/:id/versions/:versionId
 */
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

  return response.data?.data;
};

/**
 * ============================================================
 * DELETE REPOSITORY VERSION
 * ============================================================
 *
 * DELETE /api/repositories/:id/versions/:versionId
 */
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

/**
 * ============================================================
 * GET REPOSITORY FILES
 * ============================================================
 *
 * GET /api/repositories/:id/files
 *
 * NOTE:
 * The original backend currently does NOT expose this
 * endpoint. We will add the backend implementation in
 * the next Repository step.
 */
export const getRepositoryFiles = async (
  repositoryId: string,
): Promise<RepositoryFile[]> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }

  const response = await api.get(
    `/repositories/${encodeURIComponent(repositoryId)}/files`,
  );

  const data = response.data?.data;

  return Array.isArray(data) ? data : [];
};

/**
 * ============================================================
 * GET REPOSITORY FILE CONTENT
 * ============================================================
 *
 * GET /api/repositories/:id/files/:fileId
 *
 * NOTE:
 * Backend implementation will be added in a later step.
 */
export const getRepositoryFileContent = async (
  repositoryId: string,
  fileId: string,
): Promise<RepositoryFile & { content?: string }> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }

  if (!fileId) {
    throw new Error("File ID is required.");
  }

  const response = await api.get(
    `/repositories/${encodeURIComponent(repositoryId)}/files/${encodeURIComponent(fileId)}`,
  );

  return response.data?.data;
};

/**
 * ============================================================
 * UPLOAD REPOSITORY SOURCE ZIP
 * ============================================================
 *
 * POST /api/repositories/:id/files/upload
 *
 * This will be connected to the backend in the next step.
 */
export const uploadRepositorySource = async (
  repositoryId: string,
  file: File,
) => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }

  if (!file) {
    throw new Error("Source ZIP file is required.");
  }

  const isZip =
    file.name.toLowerCase().endsWith(".zip") ||
    file.type === "application/zip" ||
    file.type === "application/x-zip-compressed";

  if (!isZip) {
    throw new Error("Only ZIP files are allowed.");
  }

  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    `/repositories/${encodeURIComponent(repositoryId)}/files/upload`,
    formData,
  );

  return response.data?.data;
};

/**
 * ============================================================
 * GET REPOSITORY ISSUES
 * ============================================================
 *
 * GET /api/repositories/:id/issues
 *
 * NOTE:
 * Backend implementation will be added in a later step.
 */
export const getRepositoryIssues = async (
  repositoryId: string,
): Promise<RepositoryIssue[]> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }

  const response = await api.get(
    `/repositories/${encodeURIComponent(repositoryId)}/issues`,
  );

  const data = response.data?.data;

  return Array.isArray(data) ? data : [];
};

/**
 * ============================================================
 * GET REPOSITORY STATISTICS
 * ============================================================
 *
 * GET /api/repositories/:id/stats
 *
 * NOTE:
 * Backend implementation will be added in a later step.
 */
export const getRepositoryStats = async (
  repositoryId: string,
): Promise<RepositoryStatistics> => {
  if (!repositoryId) {
    throw new Error("Repository ID is required.");
  }

  const response = await api.get(
    `/repositories/${encodeURIComponent(repositoryId)}/stats`,
  );

  return response.data?.data;
};
