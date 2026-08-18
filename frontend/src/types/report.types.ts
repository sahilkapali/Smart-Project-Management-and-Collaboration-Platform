// =====================================================
// REPORT TYPES
// =====================================================

export interface ReportUser {
  _id?: string;

  firstName?: string;

  lastName?: string;

  email?: string;

  role?: string;
}

export interface ReportTeam {
  _id?: string;

  name?: string;

  description?: string;
}

export interface ReportProject {
  id: string;

  name: string;

  description?: string;

  createdBy?: ReportUser;

  team?: ReportTeam;

  status: string;

  startDate?: string | Date;

  dueDate?: string | Date;

  membersCount: number;
}

export interface TaskStats {
  total: number;

  completed: number;

  inProgress: number;

  todo: number;
}

export interface IssueStats {
  total: number;

  open: number;

  inProgress: number;

  resolved: number;
}

export interface ProjectReport {
  project: ReportProject;

  repositoriesCount: number;

  taskStats: TaskStats;

  issueStats: IssueStats;

  generatedAt: string | Date;
}

// =====================================================
// API RESPONSE
// =====================================================

export interface ProjectReportResponse {
  success: boolean;

  message: string;

  data: ProjectReport | null;
}
