import { Schema, model } from "mongoose";
import { IRepositoryVersion } from "../types/repository.types";

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

    archiveUrl: {
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

const RepositoryVersion = model("RepositoryVersion", repositoryVersionSchema);

export default RepositoryVersion;
