import { Document, Types } from "mongoose";

// =====================================================
// REPOSITORY
// =====================================================

export interface IRepository extends Document {
  project: Types.ObjectId;
  name: string;
  description?: string;
  githubUrl?: string;
  defaultBranch?: string;
  status: "active" | "archived" | "deleted";
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// REPOSITORY FILE
// =====================================================

export interface IRepositoryFile extends Document {
  repository: Types.ObjectId;
  version?: Types.ObjectId;
  uploadedBy: Types.ObjectId;

  name: string;
  path: string;

  type: "file" | "folder";

  size: number;
  mimeType?: string;

  url?: string;
  content?: string;
  isBinary: boolean;
}

// =====================================================
// REPOSITORY VERSION
// =====================================================
export interface IRepositoryVersion extends Document {
  repository: Types.ObjectId;
  versionNumber: string;
  title: string;
  changelog?: string;
  commitHash?: string;
  archiveUrl?: string;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVersionData {
  repository: string;
  versionNumber: string;
  title: string;
  changelog?: string;
  commitHash?: string;
  archiveUrl?: string;
  uploadedBy: string;
}

export interface UpdateVersionData {
  title?: string;
  changelog?: string;
  commitHash?: string;
  archiveUrl?: string;
}

// =====================================================
// REPOSITORY FILE DATA INPUTS
// =====================================================

export interface CreateFileData {
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

export interface UpdateFileData {
  name?: string;
  path?: string;
  content?: string;
  url?: string;
  size?: number;
  isBinary?: boolean;
}
