import { Navigate, Route, Routes } from "react-router-dom";

/* =========================================================
   AUTH
========================================================= */

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

/* =========================================================
   MAIN LAYOUT
========================================================= */

import MainLayout from "../layouts/MainLayout";

/* =========================================================
   DASHBOARD
========================================================= */

import Dashboard from "../pages/dashboard/Dashboard";

/* =========================================================
   PROFILE
========================================================= */

import Profile from "../pages/profile/Profile";
import EditProfile from "../pages/profile/EditProfile";
import ChangePassword from "../pages/profile/ChangePassword";

/* =========================================================
   PROJECTS
========================================================= */

import Projects from "../pages/projects/Projects";
import ProjectDetails from "../pages/projects/ProjectDetails";

/* =========================================================
   TEAMS
========================================================= */

import Teams from "../pages/teams/Teams";

/* =========================================================
   TASKS
========================================================= */

import Tasks from "../pages/tasks/Tasks";

/* =========================================================
   REPORTS
========================================================= */

import Reports from "../pages/reports/Reports";

/* =========================================================
   NOTIFICATIONS
========================================================= */

import NotificationsPage from "../pages/notification/NotificationsPage";

/* =========================================================
   REPOSITORY
========================================================= */

import RepositoryPage from "../pages/repository/RepositoryPage";
import RepositoryDetailPage from "../pages/repository/RepositoryDetailPage";
import RepositoryVersionHistoryPage from "../pages/repository/RepositoryVersionHistoryPage";

/* =========================================================
   ISSUES
========================================================= */

import IssuesPage from "../pages/issues/Issues";
import CreateIssuePage from "../pages/issues/CreateIssuePage";
import IssueDetailsPage from "../pages/issues/IssueDetailsPage";
import EditIssuePage from "../pages/issues/EditIssuePage";

/* =========================================================
   ACTIVITY
========================================================= */

import ActivityFeedPage from "../pages/activity/ActivityFeedPage";

/* =========================================================
   MEETINGS
========================================================= */

import MeetingListPage from "../pages/meetings/MeetingListPage";
import CreateMeetingPage from "../pages/meetings/CreateMeetingPage";
import MeetingDetailsPage from "../pages/meetings/MeetingDetailsPage";

/* =========================================================
   CALENDAR
========================================================= */

import CalendarPage from "../pages/calendar/CalendarPage";

/* =========================================================
   AI
========================================================= */

import AIPage from "../pages/ai/AIPage";

/* =========================================================
   SETTINGS
========================================================= */

import SettingsPage from "../pages/settings/SettingsPage";

/* =========================================================
   AUTH GUARD
========================================================= */

import ProtectedRoute from "../components/ProtectedRoute";

/* =========================================================
   ROUTES
========================================================= */

import { ROUTES } from "../utils/routes";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ======================================================
          PUBLIC
      ====================================================== */}

      <Route
        path={ROUTES.HOME}
        element={<Navigate to={ROUTES.LOGIN} replace />}
      />

      <Route path={ROUTES.LOGIN} element={<Login />} />

      <Route path={ROUTES.REGISTER} element={<Register />} />

      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />

      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

      {/* ======================================================
          PROTECTED APPLICATION
      ====================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* ==================================================
              DASHBOARD
          ================================================== */}

          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

          {/* ==================================================
              CALENDAR
          ================================================== */}

          <Route path="/calendar" element={<CalendarPage />} />

          {/* ==================================================
              PROFILE
          ================================================== */}

          <Route path={ROUTES.PROFILE} element={<Profile />} />

          <Route path={ROUTES.EDIT_PROFILE} element={<EditProfile />} />

          <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePassword />} />

          {/* ==================================================
              PROJECTS
          ================================================== */}

          <Route path={ROUTES.PROJECTS} element={<Projects />} />

          <Route path={ROUTES.PROJECT_DETAILS} element={<ProjectDetails />} />

          {/* ==================================================
              TASKS
          ================================================== */}

          <Route path={ROUTES.TASKS} element={<Tasks />} />

          <Route path={ROUTES.PROJECT_TASKS} element={<Tasks />} />

          {/* ==================================================
              TEAMS
          ================================================== */}

          <Route path={ROUTES.TEAMS} element={<Teams />} />

          {/* ==================================================
              REPORTS
          ================================================== */}

          <Route path={ROUTES.REPORTS} element={<Reports />} />

          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />

          {/* ==================================================
              REPOSITORY
          ================================================== */}

          <Route path={ROUTES.REPOSITORY} element={<RepositoryPage />} />

          <Route
            path={ROUTES.REPOSITORY_DETAILS}
            element={<RepositoryDetailPage />}
          />

          <Route
            path={ROUTES.REPOSITORY_HISTORY}
            element={<RepositoryVersionHistoryPage />}
          />

          {/* ==================================================
              ISSUES
          ================================================== */}

          <Route path={ROUTES.ISSUES} element={<IssuesPage />} />

          <Route path={ROUTES.CREATE_ISSUE} element={<CreateIssuePage />} />

          <Route path={ROUTES.CREATE_ISSUE_NEW} element={<CreateIssuePage />} />

          <Route path={ROUTES.ISSUE_DETAILS} element={<IssueDetailsPage />} />

          <Route path={ROUTES.EDIT_ISSUE} element={<EditIssuePage />} />

          {/* ==================================================
              ACTIVITY
          ================================================== */}

          <Route path={ROUTES.ACTIVITY} element={<ActivityFeedPage />} />

          {/* ==================================================
              MEETINGS
          ================================================== */}

          {/* Global meeting list */}
          <Route path={ROUTES.MEETINGS} element={<MeetingListPage />} />

          {/* Global meeting creation */}
          <Route
            path={ROUTES.CREATE_MEETING_GLOBAL}
            element={<CreateMeetingPage />}
          />

          {/* Project meeting list */}
          <Route path={ROUTES.PROJECT_MEETINGS} element={<MeetingListPage />} />

          {/* Project meeting creation */}
          <Route path={ROUTES.CREATE_MEETING} element={<CreateMeetingPage />} />

          {/* Meeting details */}
          <Route
            path={ROUTES.MEETING_DETAILS}
            element={<MeetingDetailsPage />}
          />

          {/* ==================================================
              PROJECT AI
          ================================================== */}

          <Route path={ROUTES.PROJECT_AI} element={<AIPage />} />

          {/* ==================================================
              SETTINGS
          ================================================== */}

          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>
      </Route>

      {/* ======================================================
          FALLBACK
      ====================================================== */}

      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
};

export default AppRoutes;
