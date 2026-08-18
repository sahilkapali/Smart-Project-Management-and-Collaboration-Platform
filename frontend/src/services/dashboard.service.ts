import api from "./api";

export interface DashboardMetrics {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTodoTasks: number;
  overdueTasks: number;
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  repositoriesCount: number;
  upcomingMeetings: number;
}

interface DashboardMetricsResponse {
  success: boolean;
  message: string;
  data: DashboardMetrics;
}

const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response =
      await api.get<DashboardMetricsResponse>("/dashboard/metrics");

    return response.data.data;
  },
};

export default dashboardService;
