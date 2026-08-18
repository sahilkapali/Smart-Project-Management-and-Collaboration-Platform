import mongoose, { Schema } from "mongoose";

interface ITaskComment {
  task: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  text: string;
}

const taskCommentSchema = new Schema<ITaskComment>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
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
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },
  },
  {
    timestamps: true,
  },
);

taskCommentSchema.index({
  task: 1,
  createdAt: 1,
});

export default mongoose.model<ITaskComment>("TaskComment", taskCommentSchema);
