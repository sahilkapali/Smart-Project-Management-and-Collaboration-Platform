import api from "./api";

import type {
  Issue,
  CreateIssuePayload,
  UpdateIssuePayload,
  IssueComment,
  IssueResponse,
  IssuesResponse,
  IssueCommentsResponse,
} from "../types/issue.types";

// ============================================================
// NORMALIZE ISSUE
// ============================================================

const normalizeIssue = (issue: Issue): Issue => {
  return {
    ...issue,
    id: issue.id ?? issue._id ?? "",
  };
};

// ============================================================
// GET ALL ISSUES
// GET /issues
// ============================================================

export const getIssues = async (): Promise<Issue[]> => {
  const response = await api.get<IssuesResponse>("/issues");

  const data = response.data?.data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeIssue);
};

// ============================================================
// GET ISSUE BY ID
// GET /issues/:id
// ============================================================

export const getIssueById = async (issueId: string): Promise<Issue> => {
  if (!issueId) {
    throw new Error("Issue ID is required.");
  }

  const response = await api.get<IssueResponse>(`/issues/${issueId}`);

  return normalizeIssue(response.data.data);
};

// ============================================================
// CREATE ISSUE
// POST /issues
// ============================================================

export const createIssue = async (data: CreateIssuePayload): Promise<Issue> => {
  const response = await api.post<IssueResponse>("/issues", data);

  return normalizeIssue(response.data.data);
};

// ============================================================
// UPDATE ISSUE
// PUT /issues/:id
// ============================================================

export const updateIssue = async (
  issueId: string,
  data: UpdateIssuePayload,
): Promise<Issue> => {
  if (!issueId) {
    throw new Error("Issue ID is required.");
  }

  const response = await api.put<IssueResponse>(`/issues/${issueId}`, data);

  return normalizeIssue(response.data.data);
};

// ============================================================
// DELETE ISSUE
// DELETE /issues/:id
// ============================================================

export const deleteIssue = async (issueId: string): Promise<void> => {
  if (!issueId) {
    throw new Error("Issue ID is required.");
  }

  await api.delete(`/issues/${issueId}`);
};

// ============================================================
// GET ISSUE COMMENTS
// GET /issues/:id/comments
// ============================================================

export const getIssueComments = async (
  issueId: string,
): Promise<IssueComment[]> => {
  if (!issueId) {
    throw new Error("Issue ID is required.");
  }

  const response = await api.get<IssueCommentsResponse>(
    `/issues/${issueId}/comments`,
  );

  return Array.isArray(response.data?.data) ? response.data.data : [];
};

// ============================================================
// ADD ISSUE COMMENT
// POST /issues/:id/comments
// ============================================================

export const addIssueComment = async (
  issueId: string,
  text: string,
): Promise<IssueComment> => {
  if (!issueId) {
    throw new Error("Issue ID is required.");
  }

  if (!text.trim()) {
    throw new Error("Comment text is required.");
  }

  const response = await api.post<{
    success: boolean;
    message?: string;
    data: IssueComment;
  }>(`/issues/${issueId}/comments`, {
    text: text.trim(),
  });

  return response.data.data;
};
