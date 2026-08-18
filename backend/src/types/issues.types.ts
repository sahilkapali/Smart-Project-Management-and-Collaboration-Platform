import { Types } from "mongoose";

// ============================================================
// ISSUE STATUS
// ============================================================

export enum ISSUE_STATUS {
  OPEN = "Open",
  IN_PROGRESS = "In Progress",
  RESOLVED = "Resolved",
  CLOSED = "Closed",
}

// ============================================================
// ISSUE PRIORITY
// ============================================================

export enum ISSUE_PRIORITY {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical",
}

// ============================================================
// ISSUE INTERFACE
// ============================================================

export interface IIssue {
  repository: Types.ObjectId;

  title: string;

  description?: string;

  status: ISSUE_STATUS;

  priority: ISSUE_PRIORITY;

  createdBy: Types.ObjectId;

  assignedTo?: Types.ObjectId;

  createdAt?: Date;

  updatedAt?: Date;
}

// ============================================================
// CREATE ISSUE DATA
// ============================================================

export interface CreateIssueData {
  repository: Types.ObjectId;

  title: string;

  description?: string;

  priority?: ISSUE_PRIORITY;

  assignedTo?: Types.ObjectId;

  createdBy: Types.ObjectId;
}

// ============================================================
// UPDATE ISSUE DATA
// ============================================================

export interface UpdateIssueData {
  title?: string;

  description?: string;

  status?: ISSUE_STATUS;

  priority?: ISSUE_PRIORITY;

  assignedTo?: Types.ObjectId;

  repository?: Types.ObjectId;
}
