import mongoose, { Document, Schema } from "mongoose";

export interface IRepositoryFile extends Document {
  repository: mongoose.Types.ObjectId;
  version?: mongoose.Types.ObjectId;

  name: string;
  path: string;

  type: "file";

  size: number;
  mimeType?: string;

  content?: string;

  isBinary: boolean;
}

const repositoryFileSchema = new Schema<IRepositoryFile>(
  {
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
      index: true,
    },

    version: {
      type: Schema.Types.ObjectId,
      ref: "RepositoryVersion",
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    path: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["file"],
      default: "file",
    },

    size: {
      type: Number,
      required: true,
      default: 0,
    },

    mimeType: {
      type: String,
      default: "",
    },

    content: {
      type: String,
      default: undefined,
    },

    isBinary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

repositoryFileSchema.index(
  {
    repository: 1,
    path: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model<IRepositoryFile>(
  "RepositoryFile",
  repositoryFileSchema,
);
