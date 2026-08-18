import mongoose, { Document, Schema } from "mongoose";

// ============================================================
// ISSUE STATUS
// ============================================================

export type IssueStatus = "Open" | "In Progress" | "Resolved" | "Closed";

// ============================================================
// ISSUE PRIORITY
// ============================================================

export type IssuePriority = "Low" | "Medium" | "High" | "Critical";

// ============================================================
// ISSUE INTERFACE
// ============================================================

export interface IIssue extends Document {
  repository: mongoose.Types.ObjectId;

  title: string;

  description?: string;

  status: IssueStatus;

  priority: IssuePriority;

  createdBy: mongoose.Types.ObjectId;

  assignedTo?: mongoose.Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}

// ============================================================
// ISSUE SCHEMA
// ============================================================

const IssueSchema = new Schema<IIssue>(
  {
    // ========================================================
    // REPOSITORY
    // ========================================================

    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
      index: true,
    },

    // ========================================================
    // TITLE
    // ========================================================

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    // ========================================================
    // DESCRIPTION
    // ========================================================

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    // ========================================================
    // STATUS
    // ========================================================

    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
      index: true,
    },

    // ========================================================
    // PRIORITY
    // ========================================================

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      index: true,
    },

    // ========================================================
    // CREATED BY
    // ========================================================

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ========================================================
    // ASSIGNED TO
    // ========================================================

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: undefined,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// ============================================================
// INDEXES
// ============================================================

IssueSchema.index({
  repository: 1,
  createdAt: -1,
});

IssueSchema.index({
  assignedTo: 1,
  status: 1,
});

// ============================================================
// MODEL
// ============================================================

const Issue = mongoose.model<IIssue>("Issue", IssueSchema);

export default Issue;
