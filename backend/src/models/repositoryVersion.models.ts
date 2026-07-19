import mongoose, { Schema, Document } from "mongoose";

export interface IRepositoryVersion extends Document {
  repository: mongoose.Types.ObjectId;
  version: string;
  message?: string;
  file?: string;
  uploadedBy: mongoose.Types.ObjectId;
}

const RepositoryVersionSchema: Schema = new Schema(
  {
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    message: String,
    file: String,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRepositoryVersion>(
  "RepositoryVersion",
  RepositoryVersionSchema
);