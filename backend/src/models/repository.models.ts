import mongoose, { Schema, Document } from "mongoose";

export interface IRepository extends Document {
  project: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  githubUrl?: string;
  createdBy: mongoose.Types.ObjectId;
}

const RepositorySchema: Schema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    githubUrl: {
      type: String,
      default: "",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRepository>(
  "Repository",
  RepositorySchema
);