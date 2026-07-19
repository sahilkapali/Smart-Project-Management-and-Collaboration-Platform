import mongoose, { Schema, Document } from "mongoose";

export interface IIssue extends Document {
  repository: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: string;
  priority: string;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
}

const IssueSchema: Schema = new Schema(
  {
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IIssue>("Issue", IssueSchema);