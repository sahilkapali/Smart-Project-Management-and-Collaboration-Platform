import type { User } from "./user.types";

// ============================================================
// REPOSITORY
// ============================================================

export interface Repository {
  _id: string;
  id?: string;

  project:
    | string
    | {
        _id: string;
        id?: string;
        name: string;
        description?: string;
      };

  name: string;

  description?: string;

  githubUrl?: string;

  createdBy:
    | string
    | User
    | {
        _id: string;
        id?: string;
        name: string;
        email: string;
        avatar?: string;
      };

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// CREATE & UPDATE REPOSITORY REQUESTS
// ============================================================

export interface CreateRepositoryRequest {
  project: string;
  name: string;
  description?: string;
  githubUrl?: string;
}

export type CreateRepositoryPayload = CreateRepositoryRequest;

export interface UpdateRepositoryRequest {
  name?: string;
  description?: string;
  githubUrl?: string;
}

export type UpdateRepositoryPayload = UpdateRepositoryRequest;

// ============================================================
// REPOSITORY VERSION
// ============================================================

export interface RepositoryVersion {
  _id: string;
  id?: string;

  repository: string | Repository;

  versionNumber: string;

  title: string;

  changelog?: string;

  commitHash?: string;

  archiveUrl?: string;

  file?: string;

  uploadedBy?:
    | string
    | User
    | {
        _id: string;
        id?: string;
        name: string;
        email: string;
        avatar?: string;
      };

  createdAt: string;

  updatedAt: string;
}

export interface CreateRepositoryVersionRequest {
  repositoryId: string;

  versionNumber: string;

  title: string;

  changelog?: string;

  commitHash?: string;

  file?: File;

  archiveUrl?: string;
}

export interface UpdateRepositoryVersionRequest {
  title?: string;

  changelog?: string;

  commitHash?: string;

  archiveUrl?: string;
}

export interface UploadVersionModalProps {
  open: boolean;

  onClose: () => void;

  repositoryId: string;

  onSuccess?: (version: RepositoryVersion) => void | Promise<void>;
}

// ============================================================
// REPOSITORY FILE & FOLDER
// ============================================================

export interface RepositoryFile {
  _id: string;
  id?: string;

  repository: string;

  version?: string;

  uploadedBy?:
    | string
    | User
    | {
        _id: string;
        id?: string;
        name: string;
        email: string;
        avatar?: string;
      };

  name: string;

  path: string;

  type: "file" | "folder";

  size: number;

  mimeType?: string;

  url?: string;

  content?: string;

  isBinary?: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface CreateRepositoryFileRequest {
  repository: string;

  version?: string;

  name: string;

  path: string;

  type?: "file" | "folder";

  size?: number;

  mimeType?: string;

  url?: string;

  content?: string;

  isBinary?: boolean;
}

export interface UpdateRepositoryFileRequest {
  name?: string;

  path?: string;

  content?: string;

  url?: string;

  size?: number;

  isBinary?: boolean;
}

// ============================================================
// REPOSITORY STATISTICS & ISSUES
// ============================================================

export interface RepositoryStatistics {
  totalFiles: number;

  totalSize: number;

  totalVersions: number;

  totalIssues: number;

  openIssues: number;

  closedIssues: number;

  lastUpdated?: string;
}

export interface RepositoryIssue {
  _id: string;
  id?: string;

  repository: string;

  title: string;

  description?: string;

  status: string;

  priority?: string;

  createdAt: string;

  updatedAt: string;
}
