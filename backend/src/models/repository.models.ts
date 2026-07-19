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
    },
    description: {
      type: String,
    },
    githubUrl: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRepository>(
  "Repository",
  RepositorySchema
);