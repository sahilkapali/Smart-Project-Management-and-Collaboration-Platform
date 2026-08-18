export const ROUTES = {
  // ============================================================
  // PUBLIC / AUTHENTICATION
  // ============================================================
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // ============================================================
  // USER / PROFILE
  // ============================================================
  PROFILE: "/profile",
  EDIT_PROFILE: "/profile/edit",
  CHANGE_PASSWORD: "/profile/change-password",

  // ============================================================
  // DASHBOARD & CALENDAR
  // ============================================================
  DASHBOARD: "/dashboard",
  CALENDAR: "/calendar",

  // ============================================================
  // PROJECTS
  // ============================================================
  PROJECTS: "/projects",
  PROJECT_DETAILS: "/projects/:projectId",

  // ============================================================
  // TASKS
  // ============================================================
  TASKS: "/tasks",
  PROJECT_TASKS: "/projects/:projectId/tasks",

  // ============================================================
  // TEAMS
  // ============================================================
  TEAMS: "/teams",

  // ============================================================
  // REPOSITORY
  // ============================================================
  REPOSITORY: "/repository",
  REPOSITORY_DETAILS: "/repository/:id",
  REPOSITORY_HISTORY: "/repository/:id/versions",
  REPOSITORY_VERSIONS: "/repository/:id/versions",

  // ============================================================
  // ISSUES
  // ============================================================
  ISSUES: "/issues",
  CREATE_ISSUE: "/issues/create",
  CREATE_ISSUE_NEW: "/issues/new",
  ISSUE_DETAILS: "/issues/:id",
  EDIT_ISSUE: "/issues/:id/edit",

  // ============================================================
  // MEETINGS
  // ============================================================
  MEETINGS: "/meetings",
  CREATE_MEETING_GLOBAL: "/meetings/create",
  PROJECT_MEETINGS: "/projects/:projectId/meetings",
  CREATE_MEETING: "/projects/:projectId/meetings/create",
  MEETING_DETAILS: "/meetings/:id",

  // ============================================================
  // AI, NOTIFICATIONS, ACTIVITY, REPORTS
  // ============================================================
  PROJECT_AI: "/projects/:projectId/ai",
  NOTIFICATIONS: "/notifications",
  ACTIVITY: "/activity",
  REPORTS: "/reports",

  // ============================================================
  // ADMIN & SETTINGS
  // ============================================================
  ADMIN_USERS: "/admin/users",
  SETTINGS: "/settings",
} as const;
