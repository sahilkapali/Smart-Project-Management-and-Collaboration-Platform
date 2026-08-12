import mongoose, { Schema, Document } from "mongoose";

export interface IIssueComment extends Document {
  issue: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const IssueCommentSchema = new Schema(
  {
    issue: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
 );

export default mongoose.model<IIssueComment>(
  "IssueComment",
  IssueCommentSchema
);