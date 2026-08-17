import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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

/*
 * CreateProjectDialog and EditProjectDialog are already
 * handled inside Projects.tsx.
 *
 * They are NOT separate routes.
 */

/* =========================================================
   TASKS
========================================================= */

import Tasks from "../pages/tasks/Tasks";

/* =========================================================
   TEAMS
========================================================= */

import Teams from "../pages/teams/Teams";

/* =========================================================
   MEETINGS
========================================================= */

import MeetingListPage from "../pages/meetings/MeetingListPage";
import CreateMeetingPage from "../pages/meetings/CreateMeetingPage";
import MeetingDetailsPage from "../pages/meetings/MeetingDetailsPage";

/* =========================================================
   AI
========================================================= */

import AIPage from "../pages/ai/AIPage";

/* =========================================================
   NOTIFICATIONS
========================================================= */

import NotificationsPage from "../pages/notification/NotificationsPage";

/* =========================================================
   REPOSITORY
========================================================= */

import RepositoryPage from "../pages/repository/RepositoryPage";

/* =========================================================
   SETTINGS
========================================================= */

import SettingsPage from "../pages/settings/SettingsPage";

/* =========================================================
   AUTH GUARD
========================================================= */

import ProtectedRoute from "../components/auth/ProtectedRoute";

/* =========================================================
   ROUTES CONSTANTS
========================================================= */

import { ROUTES } from "../utils/routes";


const AppRoutes = () => {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

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


      {/* =====================================================
          PROTECTED ROUTES
      ===================================================== */}

      <Route element={<ProtectedRoute />}>

        {/* ===================================================
            MAIN LAYOUT

            MainLayout contains:
            - Dashboard Sidebar
            - Dashboard Navbar
            - Outlet for current page
        =================================================== */}

        <Route element={<MainLayout />}>


          {/* =================================================
              DASHBOARD
          ================================================= */}

          <Route
            path={ROUTES.DASHBOARD}
            element={<Dashboard />}
          />


          {/* =================================================
              PROFILE
          ================================================= */}

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


          {/* =================================================
              PROJECTS
          ================================================= */}

          <Route
            path="/projects"
            element={<Projects />}
          />

          {/* =================================================
              PROJECT DETAILS
          ================================================= */}

          <Route
            path="/projects/:projectId"
            element={<ProjectDetails />}
          />


          {/* =================================================
              TASKS
          ================================================= */}

          <Route
            path="/tasks"
            element={<Tasks />}
          />


          {/* =================================================
              TEAMS
          ================================================= */}

          <Route
            path="/teams"
            element={<Teams />}
          />


          {/* =================================================
              PROJECT MEETINGS
          ================================================= */}

          <Route
            path="/projects/:projectId/meetings"
            element={<MeetingListPage />}
          />

          <Route
            path="/projects/:projectId/meetings/create"
            element={<CreateMeetingPage />}
          />


          {/* =================================================
              MEETING DETAILS
          ================================================= */}

          <Route
            path="/meetings/:id"
            element={<MeetingDetailsPage />}
          />


          {/* =================================================
              AI ASSISTANT
          ================================================= */}

          <Route
            path="/ai"
            element={<AIPage />}
          />


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <Route
            path={ROUTES.NOTIFICATIONS}
            element={<NotificationsPage />}
          />


          {/* =================================================
              REPOSITORY
          ================================================= */}

          <Route
            path={ROUTES.REPOSITORY}
            element={<RepositoryPage />}
          />


          {/* =================================================
              SETTINGS
          ================================================= */}

          <Route
            path="/settings"
            element={<SettingsPage />}
          />

        </Route>
      </Route>


      {/* =====================================================
          FALLBACK
      ===================================================== */}

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