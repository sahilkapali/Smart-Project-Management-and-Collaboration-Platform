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

  const issues = response.data?.data;

  if (!Array.isArray(issues)) {
    return [];
  }

  return issues.map(normalizeIssue);
};

// ============================================================
// GET ISSUES BY REPOSITORY
// GET /issues?repository=:repositoryId
// ============================================================

export const getIssuesByRepository = async (
  repositoryId: string,
): Promise<Issue[]> => {
  const id = repositoryId?.trim();

  if (!id) {
    throw new Error("Repository ID is required.");
  }

  // Attempts backend parameter filtering with client-side fallback
  const response = await api.get<IssuesResponse>(`/issues?repository=${id}`);
  const issues = response.data?.data;

  if (!Array.isArray(issues)) {
    return [];
  }

  return issues
    .filter((issue) => {
      const repo = issue.repository;
      const repoId = typeof repo === "object" ? repo?._id || repo?._id : repo;
      return !repoId || repoId === id;
    })
    .map(normalizeIssue);
};

// ============================================================
// GET ISSUE BY ID
// GET /issues/:id
// ============================================================

export const getIssueById = async (issueId: string): Promise<Issue> => {
  const id = issueId?.trim();

  if (!id) {
    throw new Error("Issue ID is required.");
  }

  const response = await api.get<IssueResponse>(`/issues/${id}`);

  if (!response.data?.data) {
    throw new Error("Issue data was not returned by the server.");
  }

  return normalizeIssue(response.data.data);
};

// ============================================================
// CREATE ISSUE
// POST /issues
// ============================================================

export const createIssue = async (data: CreateIssuePayload): Promise<Issue> => {
  const repository = data.repository?.trim();
  const title = data.title?.trim();

  if (!repository) {
    throw new Error("Repository is required.");
  }

  if (!title) {
    throw new Error("Issue title is required.");
  }

  if (title.length < 3) {
    throw new Error("Issue title must be at least 3 characters.");
  }

  const payload: CreateIssuePayload = {
    repository,

    title,

    description: data.description?.trim() || undefined,

    priority: data.priority ?? "Medium",

    assignedTo: data.assignedTo?.trim() || undefined,
  };

  const response = await api.post<IssueResponse>("/issues", payload);

  if (!response.data?.data) {
    throw new Error("Issue was created but no issue data was returned.");
  }

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
  const id = issueId?.trim();

  if (!id) {
    throw new Error("Issue ID is required.");
  }

  const payload: UpdateIssuePayload = {
    ...data,

    title: data.title !== undefined ? data.title.trim() : undefined,

    description:
      data.description !== undefined ? data.description.trim() : undefined,

    assignedTo: data.assignedTo === "" ? null : data.assignedTo,
  };

  const response = await api.put<IssueResponse>(`/issues/${id}`, payload);

  if (!response.data?.data) {
    throw new Error("Issue was updated but no issue data was returned.");
  }

  return normalizeIssue(response.data.data);
};

// ============================================================
// DELETE ISSUE
// DELETE /issues/:id
// ============================================================

export const deleteIssue = async (issueId: string): Promise<void> => {
  const id = issueId?.trim();

  if (!id) {
    throw new Error("Issue ID is required.");
  }

  await api.delete(`/issues/${id}`);
};

// ============================================================
// GET ISSUE COMMENTS
// GET /issues/:id/comments
// ============================================================

export const getIssueComments = async (
  issueId: string,
): Promise<IssueComment[]> => {
  const id = issueId?.trim();

  if (!id) {
    throw new Error("Issue ID is required.");
  }

  const response = await api.get<IssueCommentsResponse>(
    `/issues/${id}/comments`,
  );

  const comments = response.data?.data;

  if (!Array.isArray(comments)) {
    return [];
  }

  return comments;
};

// ============================================================
// ADD ISSUE COMMENT
// POST /issues/:id/comments
// ============================================================

export const addIssueComment = async (
  issueId: string,
  text: string,
): Promise<IssueComment> => {
  const id = issueId?.trim();
  const commentText = text?.trim();

  if (!id) {
    throw new Error("Issue ID is required.");
  }

  if (!commentText) {
    throw new Error("Comment text is required.");
  }

  const response = await api.post<{
    success: boolean;
    message?: string;
    data: IssueComment;
  }>(`/issues/${id}/comments`, {
    text: commentText,
  });

  if (!response.data?.data) {
    throw new Error("Comment was added but no comment data was returned.");
  }

  return response.data.data;
};
