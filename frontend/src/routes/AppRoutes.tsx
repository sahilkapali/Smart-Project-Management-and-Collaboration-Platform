import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ============================================================
// AUTH PAGES
// ============================================================

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// ============================================================
// MAIN LAYOUT
// ============================================================

import MainLayout from "../layouts/MainLayout";

// ============================================================
// DASHBOARD
// ============================================================

import Dashboard from "../pages/dashboard/Dashboard";

// ============================================================
// PROFILE
// ============================================================

import Profile from "../pages/profile/Profile";
import EditProfile from "../pages/profile/EditProfile";
import ChangePassword from "../pages/profile/ChangePassword";

// ============================================================
// PROJECTS
// ============================================================

import Projects from "../pages/projects/Projects";
import ProjectDetails from "../pages/projects/ProjectDetails";

// ============================================================
// TASKS
// ============================================================

import Tasks from "../pages/tasks/Tasks";

// ============================================================
// TEAMS
// ============================================================

import Teams from "../pages/teams/Teams";

// ============================================================
// REPORTS
// ============================================================

import Reports from "../pages/reports/Reports";

// ============================================================
// MEETINGS
// ============================================================

import MeetingListPage from "../pages/meetings/MeetingListPage";
import CreateMeetingPage from "../pages/meetings/CreateMeetingPage";
import MeetingDetailsPage from "../pages/meetings/MeetingDetailsPage";

// ============================================================
// AI
// ============================================================

import AIPage from "../pages/ai/AIPage";

// ============================================================
// NOTIFICATIONS
// ============================================================

import NotificationsPage from "../pages/notification/NotificationsPage";

// ============================================================
// REPOSITORY
// ============================================================

import RepositoryPage from "../pages/repository/RepositoryPage";

// ============================================================
// SETTINGS
// ============================================================

import SettingsPage from "../pages/settings/SettingsPage";

// ============================================================
// AUTH GUARD
// ============================================================

import ProtectedRoute from "../components/auth/ProtectedRoute";

// ============================================================
// ROUTE CONSTANTS
// ============================================================

import { ROUTES } from "../utils/routes";

const AppRoutes = () => {
  return (
    <Routes>

      {/* ======================================================
          PUBLIC ROUTES
      ====================================================== */}

      <Route
        path={ROUTES.HOME}
        element={
          <Navigate
            to={ROUTES.LOGIN}
            replace
          />
        }
      />

      <Route
        path={ROUTES.LOGIN}
        element={<Login />}
      />

      <Route
        path={ROUTES.REGISTER}
        element={<Register />}
      />

      <Route
        path={ROUTES.FORGOT_PASSWORD}
        element={<ForgotPassword />}
      />

      <Route
        path={ROUTES.RESET_PASSWORD}
        element={<ResetPassword />}
      />

      {/* ======================================================
          PROTECTED ROUTES
      ====================================================== */}

      <Route element={<ProtectedRoute />}>

        <Route element={<MainLayout />}>

          {/* ==================================================
              DASHBOARD
          ================================================== */}

          <Route
            path={ROUTES.DASHBOARD}
            element={<Dashboard />}
          />

          {/* ==================================================
              PROFILE
          ================================================== */}

          <Route
            path={ROUTES.PROFILE}
            element={<Profile />}
          />

          <Route
            path={ROUTES.EDIT_PROFILE}
            element={<EditProfile />}
          />

          <Route
            path={ROUTES.CHANGE_PASSWORD}
            element={<ChangePassword />}
          />

          {/* ==================================================
              PROJECTS
          ================================================== */}

          <Route
            path="/projects"
            element={<Projects />}
          />

          <Route
            path="/projects/:projectId"
            element={<ProjectDetails />}
          />

          {/* ==================================================
              ALL MEETINGS
              
              Shows meetings from all accessible projects.
          ================================================== */}

          <Route
            path="/meetings"
            element={<MeetingListPage />}
          />

          {/* ==================================================
              CREATE MEETING - GLOBAL
              
              IMPORTANT:
              This route is required because MeetingListPage
              navigates to /meetings/create.
              
              The project can be selected inside MeetingForm.
          ================================================== */}

          <Route
            path="/meetings/create"
            element={<CreateMeetingPage />}
          />

          {/* ==================================================
              CREATE MEETING - PROJECT SPECIFIC
              
              Existing project-specific links continue to work.
          ================================================== */}

          <Route
            path="/projects/:projectId/meetings/create"
            element={<CreateMeetingPage />}
          />

          {/* ==================================================
              OLD PROJECT MEETINGS URL
              
              Redirect to the global meetings page.
          ================================================== */}

          <Route
            path="/projects/:projectId/meetings"
            element={
              <Navigate
                to="/meetings"
                replace
              />
            }
          />

          {/* ==================================================
              MEETING DETAILS
              
              IMPORTANT:
              /meetings/create is defined ABOVE this route.
          ================================================== */}

          <Route
            path="/meetings/:id"
            element={<MeetingDetailsPage />}
          />

          {/* ==================================================
              TASKS
          ================================================== */}

          <Route
            path="/tasks"
            element={<Tasks />}
          />

          {/* ==================================================
              TEAMS
          ================================================== */}

          <Route
            path="/teams"
            element={<Teams />}
          />

          {/* ==================================================
              REPORTS
          ================================================== */}

          <Route
            path="/reports"
            element={<Reports />}
          />

          {/* ==================================================
              AI
          ================================================== */}

          <Route
            path="/ai"
            element={<AIPage />}
          />

          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          <Route
            path={ROUTES.NOTIFICATIONS}
            element={<NotificationsPage />}
          />

          {/* ==================================================
              REPOSITORY
          ================================================== */}

          <Route
            path={ROUTES.REPOSITORY}
            element={<RepositoryPage />}
          />

          {/* ==================================================
              SETTINGS
          ================================================== */}

          <Route
            path="/settings"
            element={<SettingsPage />}
          />

        </Route>

      </Route>

      {/* ======================================================
          FALLBACK
      ====================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to={ROUTES.LOGIN}
            replace
          />
        }
      />

    </Routes>
  );
};

export default AppRoutes;