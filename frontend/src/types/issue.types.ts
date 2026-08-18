// ============================================================
// ISSUE TYPES
// Matches the backend Issue model
// ============================================================

export type IssueStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export type IssuePriority = "Low" | "Medium" | "High" | "Critical";

// ============================================================
// USER
// ============================================================

export interface IssueUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

// ============================================================
// REPOSITORY
// ============================================================

export interface IssueRepository {
  _id: string;
  name?: string;
  description?: string;
  url?: string;
}

// ============================================================
// ISSUE
// ============================================================

export interface Issue {
  _id?: string;
  id?: string;

  repository: string | IssueRepository;

  title: string;

  description?: string;

  status: IssueStatus;

  priority: IssuePriority;

  createdBy: string | IssueUser;

  assignedTo?: string | IssueUser | null;

  createdAt?: string;

  updatedAt?: string;
}

// ============================================================
// CREATE ISSUE
// ============================================================

export interface CreateIssuePayload {
  repository: string;

  title: string;

  description?: string;

  priority?: IssuePriority;

  assignedTo?: string;
}

// ============================================================
// UPDATE ISSUE
// ============================================================

export interface UpdateIssuePayload {
  title?: string;

  description?: string;

  status?: IssueStatus;

  priority?: IssuePriority;

  assignedTo?: string;
}

// ============================================================
// ISSUE COMMENT USER
// ============================================================

export interface IssueCommentUser {
  _id: string;

  name: string;

  email: string;

  role?: string;
}

// ============================================================
// ISSUE COMMENT
// ============================================================

export interface IssueComment {
  _id: string;

  id?: string;

  issue: string;

  user: string | IssueCommentUser;

  text: string;

  createdAt?: string;

  updatedAt?: string;
}

// ============================================================
// API RESPONSES
// ============================================================

export interface IssueResponse {
  success: boolean;

  message?: string;

  data: Issue;
}

export interface IssuesResponse {
  success: boolean;

  count?: number;

  data: Issue[];
}

export interface IssueCommentsResponse {
  success: boolean;

  count?: number;

  data: IssueComment[];
}
