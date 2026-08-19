import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

/* =========================================================
   AUTH PAGES
========================================================= */
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ResetPassword from "../pages/auth/ResetPassword";

/* =========================================================
   MAIN LAYOUT & PROTECTED ROUTE
========================================================= */
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";

/* =========================================================
   FEATURE PAGES
========================================================= */
import AIPage from "../pages/ai/AIPage";
import ActivityFeedPage from "../pages/activity/ActivityFeedPage";
import CalendarPage from "../pages/calendar/CalendarPage";
import Dashboard from "../pages/dashboard/Dashboard";
import CreateIssuePage from "../pages/issues/CreateIssuePage";
import EditIssuePage from "../pages/issues/EditIssuePage";
import IssueDetailsPage from "../pages/issues/IssueDetailsPage";
import IssuesPage from "../pages/issues/Issues";
import CreateMeetingPage from "../pages/meetings/CreateMeetingPage";
import MeetingDetailsPage from "../pages/meetings/MeetingDetailsPage";
import MeetingListPage from "../pages/meetings/MeetingListPage";
import NotificationsPage from "../pages/notification/NotificationsPage";
import ChangePassword from "../pages/profile/ChangePassword";
import EditProfile from "../pages/profile/EditProfile";
import Profile from "../pages/profile/Profile";
import ProjectDetails from "../pages/projects/ProjectDetails";
import Projects from "../pages/projects/Projects";
import Reports from "../pages/reports/Reports";
import RepositoryDetailPage from "../pages/repository/RepositoryDetailPage";
import RepositoryPage from "../pages/repository/RepositoryPage";
import RepositoryVersionHistoryPage from "../pages/repository/RepositoryVersionHistoryPage";
import SettingsPage from "../pages/settings/SettingsPage";

/* =========================================================
   USER MANAGEMENT
========================================================= */
import Tasks from "../pages/tasks/Tasks";
import Teams from "../pages/teams/Teams";
import UserManagement from "../pages/users/UserManagement";

/* =========================================================
   ROUTES CONSTANTS
========================================================= */
import { ROUTES } from "../utils/routes";

/* =========================================================
   APP ROUTES
========================================================= */

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ======================================================
          PUBLIC ROUTES
      ====================================================== */}
      <Route
        path={ROUTES.HOME || "/"}
        element={<Navigate to={ROUTES.LOGIN || "/login"} replace />}
      />
      <Route path={ROUTES.LOGIN || "/login"} element={<Login />} />
      <Route path={ROUTES.REGISTER || "/register"} element={<Register />} />
      <Route
        path={ROUTES.FORGOT_PASSWORD || "/forgot-password"}
        element={<ForgotPassword />}
      />
      <Route
        path={ROUTES.RESET_PASSWORD || "/reset-password"}
        element={<ResetPassword />}
      />

      {/* ======================================================
          PROTECTED APPLICATION ROUTES
      ====================================================== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route
            path={ROUTES.DASHBOARD || "/dashboard"}
            element={<Dashboard />}
          />

          {/* ==================================================
              CALENDAR
          ================================================== */}
          <Route path="/calendar" element={<CalendarPage />} />

          {/* ==================================================
              PROFILE
          ================================================== */}
          <Route path={ROUTES.PROFILE || "/profile"} element={<Profile />} />
          <Route
            path={ROUTES.EDIT_PROFILE || "/profile/edit"}
            element={<EditProfile />}
          />
          <Route
            path={ROUTES.CHANGE_PASSWORD || "/profile/change-password"}
            element={<ChangePassword />}
          />

          {/* Projects */}
          <Route path={ROUTES.PROJECTS || "/projects"} element={<Projects />} />
          <Route
            path={ROUTES.PROJECT_DETAILS || "/projects/:id"}
            element={<ProjectDetails />}
          />

          {/* Tasks */}
          <Route path={ROUTES.TASKS || "/tasks"} element={<Tasks />} />
          {ROUTES.PROJECT_TASKS && (
            <Route path={ROUTES.PROJECT_TASKS} element={<Tasks />} />
          )}

          {/* Teams */}
          <Route path={ROUTES.TEAMS || "/teams"} element={<Teams />} />

          {/* User Management */}
          <Route path={ROUTES.USERS || "/users"} element={<UserManagement />} />

          {/* Reports */}
          <Route path={ROUTES.REPORTS || "/reports"} element={<Reports />} />

          {/* Notifications */}
          <Route
            path={ROUTES.NOTIFICATIONS || "/notifications"}
            element={<NotificationsPage />}
          />

          {/* ==================================================
              REPOSITORIES (WITH ROBUST FALLBACK ROUTES)
          ================================================== */}
          <Route
            path={ROUTES.REPOSITORY || "/repositories"}
            element={<RepositoryPage />}
          />
          <Route path="/repository" element={<RepositoryPage />} />

          {/* Detail View */}
          <Route
            path={ROUTES.REPOSITORY_DETAILS || "/repository/:repositoryId"}
            element={<RepositoryDetailPage />}
          />
          <Route
            path="/repositories/:repositoryId"
            element={<RepositoryDetailPage />}
          />

          {/* Version History View */}
          <Route
            path={
              ROUTES.REPOSITORY_HISTORY || "/repository/:repositoryId/history"
            }
            element={<RepositoryVersionHistoryPage />}
          />
          <Route
            path="/repositories/:repositoryId/history"
            element={<RepositoryVersionHistoryPage />}
          />

          {/* ==================================================
              ISSUES (WITH BOTH :issueId AND :id FALLBACKS)
          ================================================== */}
          <Route path={ROUTES.ISSUES || "/issues"} element={<IssuesPage />} />
          <Route
            path={ROUTES.CREATE_ISSUE || "/issues/create"}
            element={<CreateIssuePage />}
          />
          {ROUTES.CREATE_ISSUE_NEW && (
            <Route
              path={ROUTES.CREATE_ISSUE_NEW}
              element={<CreateIssuePage />}
            />
          )}

          {/* Issue Details Route Aliases */}
          <Route
            path={ROUTES.ISSUE_DETAILS || "/issues/:issueId"}
            element={<IssueDetailsPage />}
          />
          <Route path="/issues/:id" element={<IssueDetailsPage />} />

          {/* Edit Issue Route Aliases */}
          <Route
            path={ROUTES.EDIT_ISSUE || "/issues/:issueId/edit"}
            element={<EditIssuePage />}
          />
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />

          {/* Activity */}
          <Route
            path={ROUTES.ACTIVITY || "/activity"}
            element={<ActivityFeedPage />}
          />

          {/* ==================================================
              MEETINGS
          ================================================== */}
          <Route
            path={ROUTES.MEETINGS || "/meetings"}
            element={<MeetingListPage />}
          />
          <Route
            path={ROUTES.CREATE_MEETING_GLOBAL || "/meetings/create"}
            element={<CreateMeetingPage />}
          />
          <Route
            path={ROUTES.PROJECT_MEETINGS || "/projects/:projectId/meetings"}
            element={<MeetingListPage />}
          />
          <Route
            path={
              ROUTES.CREATE_MEETING || "/projects/:projectId/meetings/create"
            }
            element={<CreateMeetingPage />}
          />
          <Route
            path={ROUTES.MEETING_DETAILS || "/meetings/:id"}
            element={<MeetingDetailsPage />}
          />

          {/* AI */}
          {ROUTES.PROJECT_AI && (
            <Route path={ROUTES.PROJECT_AI} element={<AIPage />} />
          )}

          {/* Settings */}
          <Route
            path={ROUTES.SETTINGS || "/settings"}
            element={<SettingsPage />}
          />
        </Route>
      </Route>

      {/* ======================================================
          FALLBACK ROUTE
      ====================================================== */}
      <Route
        path="*"
        element={<Navigate to={ROUTES.LOGIN || "/login"} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
