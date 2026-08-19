import { getUserProfile } from "./user.service";
import projectService from "./project.service";
import taskService from "./task.service";
import { getRepositories } from "./repository.service";
import { getIssues } from "./issues.service";
import meetingService from "./meeting.service";
import { getProjectActivities } from "./activity.service";

import type { Project } from "../types/project.types";
import type { Task } from "../types/task.types";
import type { Repository } from "../types/repository.types";
import type { Issue } from "../types/issue.types";
import type { Meeting } from "../types/meeting.types";
import type { ActivityItem } from "../types/activity.types";
import type { User } from "../types/user.types";

/* ============================================================
   DASHBOARD METRICS
============================================================ */

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

/* ============================================================
   DASHBOARD TASK
============================================================ */

export interface DashboardTask {
  id: string;
  title: string;
  projectName: string;
  deadline: string;
  dueDate?: string | null;
  progress: number;
  status: "TODO" | "IN_PROGRESS" | "DONE";
}

/* ============================================================
   DASHBOARD DATA
============================================================ */

export interface DashboardData {
  user: User;
  projects: Project[];
  tasks: Task[];
  repositories: Repository[];
  issues: Issue[];
  meetings: Meeting[];
  activities: ActivityItem[];
  metrics: DashboardMetrics;
}

/* ============================================================
   ID HELPER
============================================================ */

const idOf = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  const item = value as {
    _id?: string;
    id?: string;
  };

  return item._id ?? item.id ?? "";
};

/* ============================================================
   TASK / REPOSITORY / ISSUE HELPERS
============================================================ */

const projectIdOfTask = (task: Task): string => {
  return idOf(task.project);
};

const projectIdOfRepository = (repository: Repository): string => {
  return idOf(repository.project);
};

const repositoryIdOfIssue = (issue: Issue): string => {
  return idOf(issue.repository);
};

/* ============================================================
   SAFE REQUEST
============================================================ */

const safeRequest = async <T>(
  request: () => Promise<T>,
  fallback: T,
): Promise<T> => {
  try {
    const res = await request();
    return res ?? fallback;
  } catch (error) {
    console.warn("Dashboard module request failed:", error);
    return fallback;
  }
};

/* ============================================================
   CALCULATE METRICS
============================================================ */

const calculateMetrics = (
  projects: Project[],
  tasks: Task[],
  repositories: Repository[],
  issues: Issue[],
  meetings: Meeting[],
): DashboardMetrics => {
  const now = new Date();

  let completedTasks = 0;
  let inProgressTasks = 0;
  let pendingTodoTasks = 0;
  let overdueTasks = 0;

  tasks.forEach((task) => {
    if (task.status === "Completed") {
      completedTasks += 1;
    } else if (task.status === "In Progress") {
      inProgressTasks += 1;
    } else {
      pendingTodoTasks += 1;
    }

    if (
      task.dueDate &&
      new Date(task.dueDate).getTime() < now.getTime() &&
      task.status !== "Completed"
    ) {
      overdueTasks += 1;
    }
  });

  const openIssues = issues.filter((issue) => issue.status === "Open").length;

  const resolvedIssues = issues.filter(
    (issue) => issue.status === "Resolved" || issue.status === "Closed",
  ).length;

  const upcomingMeetings = meetings.filter((meeting) => {
    const time = new Date(meeting.startTime).getTime();
    return !Number.isNaN(time) && time > now.getTime();
  }).length;

  return {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completedTasks,
    inProgressTasks,
    pendingTodoTasks,
    overdueTasks,
    totalIssues: issues.length,
    openIssues,
    resolvedIssues,
    repositoriesCount: repositories.length,
    upcomingMeetings,
  };
};

/* ============================================================
   DASHBOARD SERVICE
============================================================ */

const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const [user, rawProjects, repositories, allIssues] = await Promise.all([
      getUserProfile(),
      projectService.getProjects(),
      safeRequest(getRepositories, [] as Repository[]),
      safeRequest(getIssues, [] as Issue[]),
    ]);

    const projects = Array.isArray(rawProjects) ? rawProjects : [];

    /* ========================================================
       AUTHORIZED PROJECT IDS
    ======================================================== */

    const accessibleProjectIds = new Set(
      projects.map((project) => idOf(project)).filter(Boolean),
    );

    /* ========================================================
       REPOSITORIES
    ======================================================== */

    const scopedRepositories = (
      Array.isArray(repositories) ? repositories : []
    ).filter((repository) =>
      accessibleProjectIds.has(projectIdOfRepository(repository)),
    );

    /* ========================================================
       AUTHORIZED REPOSITORY IDS
    ======================================================== */

    const accessibleRepositoryIds = new Set(
      scopedRepositories.map((repository) => idOf(repository)).filter(Boolean),
    );

    /* ========================================================
       ISSUES
    ======================================================== */

    const scopedIssues = (Array.isArray(allIssues) ? allIssues : []).filter(
      (issue) => accessibleRepositoryIds.has(repositoryIdOfIssue(issue)),
    );

    /* ========================================================
       TASKS
    ======================================================== */

    const taskResults = await Promise.all(
      projects.map((project) => {
        const projectId = idOf(project);
        if (!projectId) return Promise.resolve([] as Task[]);

        return safeRequest(
          () => taskService.getTasks(projectId),
          [] as Task[],
        );
      }),
    );

    const tasks = taskResults.flat().filter((task) => {
      const projectId = projectIdOfTask(task);
      return Boolean(projectId) && accessibleProjectIds.has(projectId);
    });

    /* ========================================================
       MEETINGS
    ======================================================== */

    const meetingResults = await Promise.all(
      projects.map((project) => {
        const projectId = idOf(project);
        if (!projectId) return Promise.resolve([] as Meeting[]);

        return safeRequest(
          () => meetingService.getProjectMeetings(projectId),
          [] as Meeting[],
        );
      }),
    );

    const meetings = meetingResults.flat().filter((meeting) => {
      const projectId = idOf(meeting.projectId ?? (meeting as any).project);
      return accessibleProjectIds.has(projectId);
    });

    /* ========================================================
       ACTIVITIES
    ======================================================== */

    const activityResults = await Promise.all(
      projects.map((project) => {
        const projectId = idOf(project);
        if (!projectId) return Promise.resolve([] as ActivityItem[]);

        return safeRequest(
          () => getProjectActivities(projectId),
          [] as ActivityItem[],
        );
      }),
    );

    const activities = activityResults.flat();

    /* ========================================================
       METRICS
    ======================================================== */

    const metrics = calculateMetrics(
      projects,
      tasks,
      scopedRepositories,
      scopedIssues,
      meetings,
    );

    return {
      user,
      projects,
      tasks,
      repositories: scopedRepositories,
      issues: scopedIssues,
      meetings,
      activities,
      metrics,
    };
  },

  async getMetrics(): Promise<DashboardMetrics> {
    const data = await this.getDashboardData();
    return data.metrics;
  },

  toDashboardTasks(
    tasks: Task[],
    projects: Project[],
  ): DashboardTask[] {
    const projectMap = new Map(
      (Array.isArray(projects) ? projects : []).map((project) => [
        idOf(project),
        project.name,
      ]),
    );

    return (Array.isArray(tasks) ? tasks : [])
      .slice()
      .sort((a, b) => {
        const aTime = a.dueDate
          ? new Date(a.dueDate).getTime()
          : Number.MAX_SAFE_INTEGER;

        const bTime = b.dueDate
          ? new Date(b.dueDate).getTime()
          : Number.MAX_SAFE_INTEGER;

        return aTime - bTime;
      })
      .map((task) => {
        const projectId = projectIdOfTask(task);

        let status: DashboardTask["status"] = "TODO";

        if (task.status === "Completed") {
          status = "DONE";
        } else if (task.status === "In Progress") {
          status = "IN_PROGRESS";
        }

        const progress =
          status === "DONE" ? 100 : status === "IN_PROGRESS" ? 50 : 0;

        return {
          id:
            task.id ??
            task._id ??
            `${task.title}-${task.createdAt ?? ""}`,
          title: task.title,
          projectName: projectMap.get(projectId) ?? "Project",
          deadline: task.dueDate
            ? new Date(task.dueDate).toLocaleDateString()
            : "No deadline",
          dueDate: task.dueDate ?? null,
          progress,
          status,
        };
      });
  },
};

export default dashboardService;