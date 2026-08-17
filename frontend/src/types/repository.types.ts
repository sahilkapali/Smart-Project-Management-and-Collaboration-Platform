import type { ReactNode } from "react";

/* ============================================================
   USER
   ============================================================ */

export interface RepositoryUser {
  _id?: string;
  id?: string;

  name?: string;
  email?: string;
  avatar?: string;
}

/* ============================================================
   PROJECT
   ============================================================ */

export interface RepositoryProject {
  _id?: string;
  id?: string;

  name?: string;
  title?: string;

  description?: string;
}

/* ============================================================
   REPOSITORY
   ============================================================ */

export interface Repository {
  /*
   * MongoDB ID
   */
  _id: string;

  /*
   * Some existing frontend components use "id".
   * Backend primarily returns "_id".
   */
  id?: string;

  /*
   * Project reference.
   *
   * Backend normally returns an ObjectId, but the repository
   * service populates the project in several endpoints.
   */
  project: string | RepositoryProject;

  /*
   * Repository information
   */
  name: string;

  description?: string;

  /*
   * Backend field
   */
  githubUrl?: string;

  /*
   * Existing frontend pages may use these aliases.
   * They are optional because your backend model does not
   * currently define them.
   */
  gitUrl?: string;

  cloneUrl?: string;

  /*
   * Existing UI field.
   *
   * The backend does not currently store visibility,
   * so this remains optional.
   */
  visibility?: "public" | "private" | string;

  /*
   * Existing UI field.
   *
   * Your backend does not currently store programming language.
   */
  language?: string;

  /*
   * Creator
   */
  createdBy: string | RepositoryUser;

  /*
   * Dates
   */
  createdAt: string | Date;

  updatedAt: string | Date;
}

/* ============================================================
   CREATE REPOSITORY
   ============================================================ */

/**
 * Matches backend:
 *
 * POST /api/repositories
 *
 * Required backend fields:
 * project
 * name
 *
 * Optional:
 * description
 * githubUrl
 */
export interface CreateRepositoryPayload {
  project: string;

  name: string;

  description?: string;

  githubUrl?: string;
}

/* ============================================================
   UPDATE REPOSITORY
   ============================================================ */

/**
 * Matches backend:
 *
 * PATCH /api/repositories/:id
 *
 * The backend does NOT allow changing the project.
 */
export interface UpdateRepositoryPayload {
  name?: string;

  description?: string;

  githubUrl?: string;
}

/* ============================================================
   REPOSITORY VERSION
   ============================================================ */

export interface RepositoryVersion {
  /*
   * MongoDB ID
   */
  _id: string;

  /*
   * Compatibility with existing frontend components.
   */
  id?: string;

  /*
   * Repository reference
   */
  repository: string | Repository;

  /*
   * Version information
   */
  versionNumber: string;

  title?: string;

  changelog?: string;

  commitHash?: string;

  /*
   * File information
   */
  file?: string;

  fileSize?: string | number;

  downloadUrl?: string;

  /*
   * Existing frontend naming
   */
  author?: string;

  uploadedBy?: string;

  createdBy?: string | RepositoryUser;

  /*
   * Dates
   */
  createdAt: string | Date;

  updatedAt: string | Date;
}

/* ============================================================
   CREATE VERSION
   ============================================================ */

export interface CreateVersionPayload {
  versionNumber: string;

  title?: string;

  changelog?: string;

  commitHash?: string;

  file?: File;
}

/* ============================================================
   UPLOAD VERSION MODAL
   ============================================================ */

export interface UploadVersionModalProps {
  open: boolean;

  onClose: () => void;

  repositoryId: string;

  onSuccess?: () => void | Promise<void>;
}

/* ============================================================
   FILE NODE
   ============================================================ */

export interface FileNode {
  /*
   * File/folder identity
   */
  name: string;

  path: string;

  /*
   * Existing backend/frontend implementations may use
   * different values for this field.
   */
  type: "file" | "folder" | "directory" | string;

  /*
   * File metadata
   */
  size?: number;

  updatedAt?: string | Date;

  /*
   * File content.
   *
   * Useful when a selected file is opened in the repository
   * detail page.
   */
  content?: string;

  /*
   * Nested folders
   */
  children?: FileNode[];
}

/* ============================================================
   REPOSITORY ISSUE
   ============================================================ */

export interface RepositoryIssue {
  /*
   * MongoDB ID
   */
  _id: string;

  /*
   * Existing frontend components use "id".
   */
  id?: string;

  /*
   * Issue information
   */
  title: string;

  description?: string;

  status?: string;

  priority?: string;

  /*
   * Repository reference
   */
  repository?: string | Repository;

  /*
   * Existing frontend naming
   */
  author?: string;

  createdBy?: string | RepositoryUser;

  /*
   * Dates
   */
  createdAt?: string | Date;

  updatedAt?: string | Date;
}

/* ============================================================
   API RESPONSES
   ============================================================ */

export interface RepositoryResponse<T> {
  success: boolean;

  message?: string;

  data: T;
}

export interface RepositoriesResponse {
  success: boolean;

  message?: string;

  data: Repository[];
}

/* ============================================================
   REPOSITORY ACTION PROPS
   ============================================================ */

export interface RepositoryActionProps {
  onSuccess?: () => void | Promise<void>;
}

/* ============================================================
   DISPLAY ITEM
   ============================================================ */

export interface RepositoryDisplayItem {
  label: string;

  value: string | number | ReactNode;
}
