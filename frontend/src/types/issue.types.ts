// ============================================================
// ISSUE STATUS
// ============================================================

export type IssueStatus = "Open" | "In Progress" | "Resolved" | "Closed";

// ============================================================
// ISSUE PRIORITY
// ============================================================

export type IssuePriority = "Low" | "Medium" | "High" | "Critical";

// ============================================================
// USER
// ============================================================

export interface IssueUser {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

// ============================================================
// REPOSITORY
// ============================================================

export interface IssueRepository {
  _id: string;
  name: string;
  description?: string;
  githubUrl?: string;
  project?: string | IssueProject | null;
}

// ============================================================
// PROJECT
// ============================================================

export interface IssueProject {
  _id: string;
  name: string;
  description?: string;
}

// ============================================================
// ISSUE
// ============================================================

export interface Issue {
  _id?: string;
  id?: string;

  repository: string | IssueRepository;

  title: string;

  description?: string | null;

  status: IssueStatus;

  priority: IssuePriority;

  createdBy: string | IssueUser;

  assignedTo?: string | IssueUser | null;

  createdAt?: string;

  updatedAt?: string;
}

// ============================================================
// CREATE ISSUE PAYLOAD
// ============================================================

export interface CreateIssuePayload {
  repository: string;

  title: string;

  description?: string;

  priority?: IssuePriority;

  assignedTo?: string;
}

// ============================================================
// UPDATE ISSUE PAYLOAD
// ============================================================

export interface UpdateIssuePayload {
  title?: string;

  description?: string;

  status?: IssueStatus;

  priority?: IssuePriority;

  assignedTo?: string | null;
}

// ============================================================
// ISSUE COMMENT USER
// ============================================================

export interface IssueCommentUser {
  _id: string;

  name?: string;

  email?: string;

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
// API RESPONSE
// ============================================================

export interface IssueResponse {
  success: boolean;

  message?: string;

  data: Issue;
}

// ============================================================
// ISSUES RESPONSE
// ============================================================

export interface IssuesResponse {
  success: boolean;

  message?: string;

  count?: number;

  data: Issue[];
}

// ============================================================
// ISSUE COMMENTS RESPONSE
// ============================================================

export interface IssueCommentsResponse {
  success: boolean;

  message?: string;

  count?: number;

  data: IssueComment[];
}
