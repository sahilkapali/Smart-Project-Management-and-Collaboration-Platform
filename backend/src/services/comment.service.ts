import Comment from "../models/comment.models";

// Create Comment
export const createCommentService = async (data: any) => {
  return await Comment.create(data);
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