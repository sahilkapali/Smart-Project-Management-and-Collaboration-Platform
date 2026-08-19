import Comment from "../models/comment.models";
import Task from "../models/task.models";
import { createNotification } from "./notification.service";
import {
  NotificationType,
  NotificationEntityType,
} from "../types/notification.types";

// Create Comment
export const createCommentService = async (data: any) => {
  const comment = await Comment.create(data);
  await comment.populate("user", "firstName lastName email");

  const authorId = comment.user?._id?.toString() || data.user?.toString();

  // Dispatch notification if the comment is linked to a task/issue
  if (comment.issue) {
    const task = await Task.findById(comment.issue);

    if (task) {
      const assigneeId = task.assignedTo?.toString();
      const creatorId = task.createdBy?.toString();

      // Notify Assignee
      if (assigneeId && assigneeId !== authorId) {
        await createNotification(
          assigneeId,
          `New comment added to task "${task.title}"`,
          NotificationType.COMMENT_ADDED,
          authorId,
          task._id.toString(),
          NotificationEntityType.TASK
        );
      }

      // Notify Creator (if distinct from assignee and author)
      if (
        creatorId &&
        creatorId !== authorId &&
        creatorId !== assigneeId
      ) {
        await createNotification(
          creatorId,
          `New comment added to task "${task.title}"`,
          NotificationType.COMMENT_ADDED,
          authorId,
          task._id.toString(),
          NotificationEntityType.TASK
        );
      }
    }
  }

  return comment;
};

// Get All Comments
export const getCommentsService = async () => {
  return await Comment.find()
    .populate("issue")
    .populate("user");
};

// Get Comments of an Issue
export const getCommentsByIssueService = async (issueId: string) => {
  return await Comment.find({
    issue: issueId,
  }).populate("user");
};

// Update Comment
export const updateCommentService = async (
  id: string,
  data: any
) => {
  return await Comment.findByIdAndUpdate(id, data, {
    new: true,
  });
};

// Delete Comment
export const deleteCommentService = async (id: string) => {
  return await Comment.findByIdAndDelete(id);
};