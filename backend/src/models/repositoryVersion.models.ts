import mongoose, { Schema, Document } from "mongoose";

export interface IRepositoryVersion extends Document {
  repository: mongoose.Types.ObjectId;
  versionNumber: string;
  title: string;
  changelog?: string;
  commitHash?: string;
  file?: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const repositoryVersionSchema = new Schema<IRepositoryVersion>(
  {
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
      index: true,
    },

    versionNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    changelog: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    commitHash: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    file: {
      type: String,
      default: "",
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

repositoryVersionSchema.index(
  {
    repository: 1,
    versionNumber: 1,
  },
  {
    unique: true,
  },
);

const RepositoryVersion = mongoose.model<IRepositoryVersion>(
  "RepositoryVersion",
  repositoryVersionSchema,
);

export default RepositoryVersion;
