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
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "DONE";
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
   TASK PROJECT ID
============================================================ */

const projectIdOfTask = (
  task: Task,
): string => {
  return idOf(task.project);
};

/* ============================================================
   REPOSITORY PROJECT ID
============================================================ */

const projectIdOfRepository = (
  repository: Repository,
): string => {
  return idOf(repository.project);
};

/* ============================================================
   ISSUE REPOSITORY ID
============================================================ */

const repositoryIdOfIssue = (
  issue: Issue,
): string => {
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
    return await request();
  } catch (error) {
    console.warn(
      "Dashboard module request failed:",
      error,
    );

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
      new Date(task.dueDate).getTime() <
        now.getTime() &&
      task.status !== "Completed"
    ) {
      overdueTasks += 1;
    }
  });

  const openIssues = issues.filter(
    (issue) =>
      issue.status === "Open",
  ).length;

  const resolvedIssues = issues.filter(
    (issue) =>
      issue.status === "Resolved" ||
      issue.status === "Closed",
  ).length;

  const upcomingMeetings =
    meetings.filter(
      (meeting) => {
        const time = new Date(
          meeting.startTime,
        ).getTime();

        return (
          !Number.isNaN(time) &&
          time > now.getTime()
        );
      },
    ).length;

  return {
    totalProjects:
      projects.length,

    totalTasks:
      tasks.length,

    completedTasks,

    inProgressTasks,

    pendingTodoTasks,

    overdueTasks,

    totalIssues:
      issues.length,

    openIssues,

    resolvedIssues,

    repositoriesCount:
      repositories.length,

    upcomingMeetings,
  };
};

/* ============================================================
   DASHBOARD SERVICE
============================================================ */

const dashboardService = {
  /* ==========================================================
     GET COMPLETE DASHBOARD

     IMPORTANT:
     GET /projects is the source of truth for project access.

     Therefore:
     - Member sees only projects returned for that member.
     - Project manager sees only projects returned for them.
     - Admin sees projects returned for the admin.

     We do NOT modify backend permissions here.
  ========================================================== */

  async getDashboardData(): Promise<DashboardData> {
    const [
      user,
      projects,
      repositories,
      allIssues,
    ] = await Promise.all([
      getUserProfile(),

      projectService.getProjects(),

      safeRequest(
        getRepositories,
        [] as Repository[],
      ),

      safeRequest(
        getIssues,
        [] as Issue[],
      ),
    ]);

    /* ========================================================
       AUTHORIZED PROJECT IDS
    ======================================================== */

    const accessibleProjectIds =
      new Set(
        projects
          .map(
            (project) =>
              project.id,
          )
          .filter(Boolean),
      );

    /* ========================================================
       REPOSITORIES
    ======================================================== */

    const scopedRepositories =
      repositories.filter(
        (repository) =>
          accessibleProjectIds.has(
            projectIdOfRepository(
              repository,
            ),
          ),
      );

    /* ========================================================
       AUTHORIZED REPOSITORY IDS
    ======================================================== */

    const accessibleRepositoryIds =
      new Set(
        scopedRepositories
          .map(
            (repository) =>
              repository._id,
          )
          .filter(Boolean),
      );

    /* ========================================================
       ISSUES
    ======================================================== */

    const scopedIssues =
      allIssues.filter(
        (issue) =>
          accessibleRepositoryIds.has(
            repositoryIdOfIssue(
              issue,
            ),
          ),
      );

    /* ========================================================
       TASKS

       Only load tasks for accessible projects.
    ======================================================== */

    const taskResults =
      await Promise.all(
        projects.map(
          (project) =>
            safeRequest(
              () =>
                taskService.getTasks(
                  project.id,
                ),
              [] as Task[],
            ),
        ),
      );

    const tasks =
      taskResults
        .flat()
        .filter((task) => {
          const projectId =
            projectIdOfTask(task);

          /*
           * IMPORTANT:
           * A task without a valid project ID
           * must NOT be displayed.
           */
          return (
            Boolean(projectId) &&
            accessibleProjectIds.has(
              projectId,
            )
          );
        });

    /* ========================================================
       MEETINGS
    ======================================================== */

    const meetingResults =
      await Promise.all(
        projects.map(
          (project) =>
            safeRequest(
              () =>
                meetingService.getProjectMeetings(
                  project.id,
                ),
              [] as Meeting[],
            ),
        ),
      );

    const meetings =
      meetingResults
        .flat()
        .filter(
          (meeting) =>
            accessibleProjectIds.has(
              meeting.projectId,
            ),
        );

    /* ========================================================
       ACTIVITIES
    ======================================================== */

    const activityResults =
      await Promise.all(
        projects.map(
          (project) =>
            safeRequest(
              () =>
                getProjectActivities(
                  project.id,
                ),
              [] as ActivityItem[],
            ),
        ),
      );

    const activities =
      activityResults.flat();

    /* ========================================================
       METRICS
    ======================================================== */

    const metrics =
      calculateMetrics(
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

      repositories:
        scopedRepositories,

      issues:
        scopedIssues,

      meetings,

      activities,

      metrics,
    };
  },

  /* ==========================================================
     GET METRICS
  ========================================================== */

  async getMetrics(): Promise<DashboardMetrics> {
    const data =
      await this.getDashboardData();

    return data.metrics;
  },

  /* ==========================================================
     CONVERT TASKS FOR DASHBOARD
  ========================================================== */

  toDashboardTasks(
    tasks: Task[],
    projects: Project[],
  ): DashboardTask[] {
    const projectMap =
      new Map(
        projects.map(
          (project) => [
            project.id,
            project.name,
          ],
        ),
      );

    return tasks
      .slice()
      .sort((a, b) => {
        const aTime = a.dueDate
          ? new Date(
              a.dueDate,
            ).getTime()
          : Number.MAX_SAFE_INTEGER;

        const bTime = b.dueDate
          ? new Date(
              b.dueDate,
            ).getTime()
          : Number.MAX_SAFE_INTEGER;

        return aTime - bTime;
      })
      .map((task) => {
        const projectId =
          projectIdOfTask(task);

        let status:
          DashboardTask["status"] =
          "TODO";

        if (
          task.status ===
          "Completed"
        ) {
          status = "DONE";
        } else if (
          task.status ===
          "In Progress"
        ) {
          status =
            "IN_PROGRESS";
        }

        const progress =
          status === "DONE"
            ? 100
            : status ===
                "IN_PROGRESS"
              ? 50
              : 0;

        return {
          id:
            task.id ??
            task._id ??
            `${task.title}-${task.createdAt ?? ""}`,

          title:
            task.title,

          projectName:
            projectMap.get(
              projectId,
            ) ??
            "Project",

          deadline:
            task.dueDate
              ? new Date(
                  task.dueDate,
                ).toLocaleDateString()
              : "No deadline",

          dueDate:
            task.dueDate ??
            null,

          progress,

          status,
        };
      });
  },
};

export default dashboardService;