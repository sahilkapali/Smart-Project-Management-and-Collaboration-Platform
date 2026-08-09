export interface IProjectReport {
  projectId: string;
  project: any;

  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };

  issues: {
    total: number;
    open: number;
    closed: number;
  };

  repositories: {
    total: number;
  };
}