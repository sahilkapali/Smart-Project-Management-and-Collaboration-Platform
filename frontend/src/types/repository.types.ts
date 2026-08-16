export type ItemType = 'folder' | 'code' | 'pdf' | 'svg' | 'docx' | 'xlsx' | 'file';

export interface RepositoryVersion {
  _id?: string;
  id?: string;
  projectId?: string;
  versionNumber: string;
  title?: string;
  changelog?: string;
  author?: string;
  uploadedBy?: string;
  commitHash?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: string;
  downloadUrl?: string;
  createdAt?: string;
}

export interface Repository {
  _id?: string;
  id?: string;
  name: string;
  project?: string;
  description?: string;
  githubUrl?: string;
  cloneUrl?: string;
  gitUrl?: string;
  visibility?: 'public' | 'private' | string;
  language?: string;
  versions?: RepositoryVersion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: ItemType;
  path: string;
  size?: number | string;
  updatedAt?: string;
  content?: string;
  children?: FileNode[];
}

export interface RepositoryIssue {
  id: string;
  title: string;
  status: 'open' | 'closed' | 'in_progress' | string;
  priority?: string;
  createdAt?: string;
  author?: string;
  description?: string;
}

export interface CreateVersionPayload {
  projectId?: string;
  versionNumber: string;
  title?: string;
  changelog?: string;
  commitHash?: string;
  file?: File;
}

// Modal Props Types
export interface UploadVersionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  repositoryId: string;
}

export interface CreateRepositoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface EditRepositoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  repository: Repository | null;
}