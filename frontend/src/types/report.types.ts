export interface ReportTaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
}

export interface ReportIssueStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export interface ReportProject {
  id: string;
  name: string;
  description?: string;
  createdBy?: unknown;
  team?: unknown;
  status: string;
  startDate?: string;
  dueDate?: string;
  membersCount: number;
}

export interface ProjectReportData {
  project: ReportProject;
  repositoriesCount: number;
  taskStats: ReportTaskStats;
  issueStats: ReportIssueStats;
  generatedAt: string;
}

export interface ProjectReportResponse {
  success: boolean;
  message: string;
  data: ProjectReportData;
}
