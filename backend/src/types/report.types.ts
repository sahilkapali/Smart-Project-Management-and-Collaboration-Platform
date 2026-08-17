export interface TaskStatusReport {
  todo: number;
  inProgress: number;
  completed: number;
  total: number;
}

export interface TaskPriorityReport {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface ProjectStatusReport {
  planning: number;
  active: number;
  completed: number;
  archived: number;
  total: number;
}

export interface TeamReport {
  total: number;
  totalMembers: number;
}

export interface OverdueTaskReport {
  total: number;
  tasks: Array<{
    _id: string;
    title: string;
    project: string;
    assignedTo?: string;
    dueDate: Date;
    priority: string;
    status: string;
  }>;
}

export interface ProjectReport {
  _id: string;
  name: string;
  status: string;
  team: string;
  startDate?: Date;
  dueDate?: Date;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  progress: number;
}

export interface ReportsSummary {
  projects: ProjectStatusReport;
  tasks: TaskStatusReport;
  priorities: TaskPriorityReport;
  teams: TeamReport;
  overdueTasks: OverdueTaskReport;
  projectReports: ProjectReport[];
}