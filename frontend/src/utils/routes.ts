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
  // DASHBOARD
  // ============================================================

  DASHBOARD: "/dashboard",

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
  REPOSITORY_HISTORY: "/repository/:id/history",

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

  // Global meetings page
  MEETINGS: "/meetings",

  // Global create meeting
  CREATE_MEETING_GLOBAL: "/meetings/create",

  // Meetings belonging to a project
  PROJECT_MEETINGS: "/projects/:projectId/meetings",

  // Create meeting for a specific project
  CREATE_MEETING: "/projects/:projectId/meetings/create",

  // Meeting details
  MEETING_DETAILS: "/meetings/:id",

  // ============================================================
  // AI
  // ============================================================

  PROJECT_AI: "/projects/:projectId/ai",

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  NOTIFICATIONS: "/notifications",

  // ============================================================
  // ACTIVITY
  // ============================================================

  ACTIVITY: "/activity",

  // ============================================================
  // REPORTS
  // ============================================================

  REPORTS: "/reports",

  // ============================================================
  // SETTINGS
  // ============================================================

  SETTINGS: "/settings",
} as const;
