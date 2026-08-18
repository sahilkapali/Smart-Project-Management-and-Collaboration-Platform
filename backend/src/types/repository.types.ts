import { Document, Types } from "mongoose";

// =====================================================
// REPOSITORY
// =====================================================

export interface IRepository extends Document {
  project: Types.ObjectId;

  name: string;

  description?: string;

  githubUrl?: string;

  createdBy: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}

// =====================================================
// REPOSITORY FILE
// =====================================================

export interface IRepositoryFile extends Document {
  repository: Types.ObjectId;

  name: string;

  path: string;

  size: number;

  url?: string;

  mimeType?: string;

  createdAt: Date;

  updatedAt: Date;
}
