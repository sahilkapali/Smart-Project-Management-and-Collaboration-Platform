import mongoose, { Document, Schema } from "mongoose";

// ============================================================
// ISSUE COMMENT INTERFACE
// ============================================================

export interface IIssueComment extends Document {
  issue: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// ISSUE COMMENT SCHEMA
// ============================================================

const issueCommentSchema = new Schema<IIssueComment>(
  {
    // ========================================================
    // ISSUE
    // ========================================================

    issue: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
      index: true,
    },

    // ========================================================
    // USER
    // ========================================================

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ========================================================
    // COMMENT TEXT
    // ========================================================

    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
  },
);

// ============================================================
// MODEL
// ============================================================

const IssueComment = mongoose.model<IIssueComment>(
  "IssueComment",
  issueCommentSchema,
);

export default IssueComment;
