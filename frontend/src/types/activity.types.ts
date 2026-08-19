// activity.types.ts
export type ActivityAction =
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_DELETED"
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_ASSIGNED"
  | "TASK_COMPLETED"
  | "TASK_DELETED"
  | "COMMENT_ADDED"
  | "ISSUE_CREATED"
  | "ISSUE_UPDATED"
  | "ISSUE_CLOSED"
  | "ISSUE_DELETED"
  | "REPOSITORY_CREATED"
  | "REPOSITORY_UPDATED"
  | "REPOSITORY_DELETED"
  | "TEAM_CREATED"
  | "MEMBER_ADDED"
  | "MEMBER_REMOVED"
  | "MEETING_CREATED"
  | "MEETING_UPDATED"
  | "MEETING_CANCELLED"
  | "SYSTEM_ACTIVITY";

export type ActivityEntityType =
  | "PROJECT"
  | "TASK"
  | "COMMENT"
  | "ISSUE"
  | "REPOSITORY"
  | "TEAM"
  | "MEETING";

export interface ActivityUser {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
}

export interface ActivityProject {
  _id: string;
  name: string;
}

export interface ActivityItem {
  _id: string;
  id: string;
  user: ActivityUser;
  project?: ActivityProject;
  action: ActivityAction;
  description: string;
  entityType?: ActivityEntityType;
  entityId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityFilterParams {
  projectId?: string;
  entityType?: ActivityEntityType;
  limit?: number;
}
