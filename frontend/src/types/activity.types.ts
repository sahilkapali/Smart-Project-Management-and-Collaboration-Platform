export type ActivityAction =
  | 'issue_created'
  | 'issue_updated'
  | 'issue_resolved'
  | 'version_uploaded'
  | 'repo_created'
  | 'comment_added'
  | 'project_updated';

export interface ActivityUser {
  name: string;
  email?: string;
  avatar?: string;
}

export interface ActivityItem {
  id?: string;
  _id?: string;
  user: ActivityUser;
  action: ActivityAction;
  entityName: string;
  entityType: 'issue' | 'repository' | 'project' | 'comment';
  targetUrl?: string;
  details?: string;
  createdAt: string;
}

export interface ActivityFilterParams {
  projectId?: string;
  entityType?: string;
  limit?: number;
  page?: number;
}