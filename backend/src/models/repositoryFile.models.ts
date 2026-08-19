import mongoose, { Document, Schema } from "mongoose";
import { IRepositoryFile } from "../types/repository.types";


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

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
      enum: ["file", "folder"],
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

    url: {
      type: String,
      trim: true,
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
  }
);


repositoryFileSchema.index(
  {
    repository: 1,
    version: 1, 
    path: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model<IRepositoryFile>(
  "RepositoryFile",
  repositoryFileSchema
);