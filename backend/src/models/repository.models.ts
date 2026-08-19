import { Schema, model, Document, Types } from "mongoose";
import { IRepository } from "../types/repository.types";



// ============================================================
// SCHEMA
// ============================================================

const repositorySchema = new Schema<IRepository>(
  {
    // ======================================================
    // PROJECT
    // ======================================================
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    // ======================================================
    // NAME
    // ======================================================
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // ======================================================
    // DESCRIPTION
    // ======================================================
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    // ======================================================
    // GITHUB URL
    // ======================================================
    githubUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    // ======================================================
    // DEFAULT BRANCH
    // ======================================================
    defaultBranch: {
      type: String,
      default: "main",
      trim: true,
      maxlength: 50,
    },

    // ======================================================
    // STATUS
    // ======================================================
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
      index: true, 
    },

    // ======================================================
    // CREATED BY
    // ======================================================
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// UNIQUE PROJECT + REPOSITORY NAME
// ============================================================
repositorySchema.index(
  {
    project: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

// ============================================================
// MODEL
// ============================================================
const Repository = model<IRepository>("Repository", repositorySchema);

export default Repository;