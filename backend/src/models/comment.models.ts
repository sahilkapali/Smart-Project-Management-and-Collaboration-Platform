import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  issue: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  comment: string;
}

const CommentSchema: Schema = new Schema(
  {
    issue: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IComment>("Comment", CommentSchema);