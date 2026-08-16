import api from "./api";

export interface CommentItem {
  _id: string;
  content: string;
  issue: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
}

export const getCommentsByIssue = async (issueId: string): Promise<CommentItem[]> => {
  const response = await api.get(`/issues/${issueId}/comments`);
  return response.data.data || response.data;
};

export const addComment = async (
  issueId: string,
  content: string
): Promise<CommentItem> => {
  const response = await api.post(`/issues/${issueId}/comments`, { content });
  return response.data.data || response.data;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  await api.delete(`/comments/${commentId}`);
};