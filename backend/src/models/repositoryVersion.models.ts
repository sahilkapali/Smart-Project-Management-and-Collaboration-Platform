import mongoose, { Schema, Document } from "mongoose";

export interface IRepositoryVersion extends Document {
  repository: mongoose.Types.ObjectId;
  version: string;
  message?: string;
  file?: string;
  uploadedBy: mongoose.Types.ObjectId;
}

const RepositoryVersionSchema = new Schema<IRepositoryVersion>(
  {
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },

    version: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
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
  }
);

export default mongoose.model<IRepositoryVersion>(
  "RepositoryVersion",
  RepositoryVersionSchema
);