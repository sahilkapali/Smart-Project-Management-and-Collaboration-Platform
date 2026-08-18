import type { User } from "./user.types";

// ============================================================
// REPOSITORY
// ============================================================

export interface Repository {
  _id: string;

  project:
    | string
    | {
        _id: string;
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
        name: string;
        email: string;
        avatar?: string;
      };

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// CREATE REPOSITORY
// ============================================================

export interface CreateRepositoryRequest {
  project: string;
  name: string;
  description?: string;
  githubUrl?: string;
}

/*
 * Backward-compatible name used by
 * CreateRepositoryModal.tsx
 */
export type CreateRepositoryPayload = CreateRepositoryRequest;

// ============================================================
// UPDATE REPOSITORY
// ============================================================

export interface UpdateRepositoryRequest {
  name?: string;
  description?: string;
  githubUrl?: string;
}

/*
 * Backward-compatible name used by
 * EditRepositoryModal.tsx
 */
export type UpdateRepositoryPayload = UpdateRepositoryRequest;

// ============================================================
// REPOSITORY VERSION
// ============================================================

export interface RepositoryVersion {
  _id: string;

  repository: string | Repository;

  versionNumber: string;

  title: string;

  changelog?: string;

  commitHash?: string;

  file?: string;

  uploadedBy:
    | string
    | User
    | {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
      };

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// CREATE VERSION REQUEST
// ============================================================

export interface CreateRepositoryVersionRequest {
  repositoryId: string;

  versionNumber: string;

  title: string;

  changelog?: string;

  commitHash?: string;

  file?: File;
}

// ============================================================
// UPLOAD VERSION MODAL PROPS
// ============================================================

export interface UploadVersionModalProps {
  open: boolean;

  onClose: () => void;

  repositoryId: string;

  onSuccess?: (version: RepositoryVersion) => void;
}

// ============================================================
// REPOSITORY STATISTICS
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

// ============================================================
// REPOSITORY FILE
// ============================================================

export interface RepositoryFile {
  _id: string;

  repository: string;

  name: string;

  path: string;

  size: number;

  url?: string;

  mimeType?: string;

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// REPOSITORY ISSUE
// ============================================================

export interface RepositoryIssue {
  _id: string;

  repository: string;

  title: string;

  description?: string;

  status: string;

  priority?: string;

  createdAt: string;

  updatedAt: string;
}
