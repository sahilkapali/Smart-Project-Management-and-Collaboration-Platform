export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Issue {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  repositoryId?: string; 
  projectId?: string;    
  author?: string;
  assignee?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IssueComment {
  _id?: string;
  id?: string;
  issueId: string;
  text: string;
  author: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  priority: IssuePriority;
  repositoryId?: string;
  projectId?: string;
  assignee?: string;
}