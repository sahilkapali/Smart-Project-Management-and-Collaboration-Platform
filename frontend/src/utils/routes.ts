export const ROUTES = {
  HOME: "/",

  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  DASHBOARD: "/dashboard",

  CALENDAR: "/calendar",

  PROFILE: "/profile",
  EDIT_PROFILE: "/profile/edit",
  CHANGE_PASSWORD: "/profile/change-password",

  PROJECTS: "/projects",
  PROJECT_DETAILS: "/projects/:projectId",

  PROJECT_TASKS: "/projects/:projectId/tasks",

  TEAMS: "/teams",

  TASKS: "/tasks",

  REPORTS: "/reports",

  NOTIFICATIONS: "/notifications",

  REPOSITORY: "/repository",
  REPOSITORY_DETAILS: "/repository/:repositoryId",
  REPOSITORY_HISTORY: "/repository/:repositoryId/history",

  ISSUES: "/issues",
  CREATE_ISSUE: "/issues/create",
  CREATE_ISSUE_NEW: "/issues/new",
  ISSUE_DETAILS: "/issues/:issueId",
  EDIT_ISSUE: "/issues/:issueId/edit",

  ACTIVITY: "/activity",

  MEETINGS: "/meetings",
  CREATE_MEETING_GLOBAL: "/meetings/create",
  PROJECT_MEETINGS: "/projects/:projectId/meetings",
  CREATE_MEETING: "/projects/:projectId/meetings/create",
  MEETING_DETAILS: "/meetings/:meetingId",

  PROJECT_AI: "/projects/:projectId/ai",

  // ========================================================
  // USER MANAGEMENT
  // ========================================================

  USERS: "/users",

  SETTINGS: "/settings",
} as const;
