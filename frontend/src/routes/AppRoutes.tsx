import { Routes, Route, Navigate } from "react-router-dom";

// ============================================================
// AUTH PAGES
// ============================================================

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// ============================================================
// MAIN PAGES
// ============================================================

import Dashboard from "../pages/dashboard/Dashboard";

import Profile from "../pages/profile/Profile";
import EditProfile from "../pages/profile/EditProfile";
import ChangePassword from "../pages/profile/ChangePassword";

import Projects from "../pages/projects/Projects";
import ProjectDetails from "../pages/projects/ProjectDetails";

// ============================================================
// TEAMS
// ============================================================

import Teams from "../pages/teams/Teams";

// ============================================================
// NOTIFICATIONS
// ============================================================

import NotificationsPage from "../pages/notification/NotificationsPage";

// ============================================================
// REPOSITORY
// ============================================================

import RepositoryPage from "../pages/repository/RepositoryPage";
import RepositoryDetailPage from "../pages/repository/RepositoryDetailPage";

// ============================================================
// ISSUES
// ============================================================

import IssuesPage from "../pages/issues/Issues";
import CreateIssuePage from "../pages/issues/CreateIssuePage";
import IssueDetailsPage from "../pages/issues/IssueDetailsPage";
import EditIssuePage from "../pages/issues/EditIssuePage";
import RepositoryVersionHistoryPage from "../pages/repository/RepositoryVersionHistoryPage";

// ============================================================
// Activities
// ============================================================

import ActivityFeedPage from "../pages/activity/ActivityFeedPage";

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
// SETTINGS
// ============================================================

import SettingsPage from "../pages/settings/SettingsPage";

// ============================================================
// AUTH GUARD
// ============================================================

import ProtectedRoute from "../components/auth/ProtectedRoute";

// ============================================================
// MAIN LAYOUT
// ============================================================

import MainLayout from "../layouts/MainLayout";

// ============================================================
// ROUTE CONSTANTS
// ============================================================

import { ROUTES } from "../utils/routes";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ====================================================== */}
      {/* PUBLIC ROUTES                                          */}
      {/* ====================================================== */}

      {/* Home */}
      <Route
        path={ROUTES.HOME}
        element={<Navigate to={ROUTES.LOGIN} replace />}
      />

      {/* Login */}
      <Route path={ROUTES.LOGIN} element={<Login />} />

      {/* Register */}
      <Route path={ROUTES.REGISTER} element={<Register />} />

      {/* Forgot Password */}
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />

      {/* Reset Password */}
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

      {/* ====================================================== */}
      {/* PROTECTED ROUTES                                       */}
      {/* ====================================================== */}

      <Route element={<ProtectedRoute />}>
        {/* ==================================================== */}
        {/* MAIN APPLICATION LAYOUT                              */}
        {/* ==================================================== */}

        <Route element={<MainLayout />}>
          {/* ================================================== */}
          {/* DASHBOARD                                          */}
          {/* ================================================== */}
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          {/* ================================================== */}
          {/* PROFILE                                            */}
          {/* ================================================== */}
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.EDIT_PROFILE} element={<EditProfile />} />
          <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePassword />} />
          {/* ================================================== */}
          {/* PROJECTS                                           */}
          {/* ================================================== */}
          <Route
            path={ROUTES.PROJECTS || "/projects"}
            element={<Projects />}
          />
          <Route
            path={ROUTES.PROJECT_DETAILS || "/projects/:id"}
            element={<ProjectDetails />}
          />
          {/* ================================================== */}
          {/* TEAMS                                              */}
          {/* ================================================== */}
          <Route path="/teams" element={<Teams />} />
          {/* ================================================== */}
          {/* MEETINGS                                           */}
          {/* ================================================== */}
          <Route
            path="/projects/:projectId/meetings"
            element={<MeetingListPage />}
          />
          <Route
            path="/projects/:projectId/meetings/create"
            element={<CreateMeetingPage />}
          />
          <Route path="/meetings/:id" element={<MeetingDetailsPage />} />
          {/* ================================================== */}
          {/* AI                                                 */}
          {/* ================================================== */}
          <Route path="/ai" element={<AIPage />} />
          {/* ================================================== */}
          {/* NOTIFICATIONS                                      */}
          {/* ================================================== */}
          <Route
            path={ROUTES.NOTIFICATIONS}
            element={<NotificationsPage />}
          />
          {/* ================================================== */}
          {/* REPOSITORY                                         */}
          {/* ================================================== */}
          <Route path={ROUTES.REPOSITORY} element={<RepositoryPage />} />
          <Route path="/repository/:id" element={<RepositoryDetailPage />} />
          <Route
            path="/repository/:id/history"
            element={<RepositoryVersionHistoryPage />}
          />
          {/* ================================================== */}
          {/* ISSUES                                             */}
          {/* ================================================== */}
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/issues/create" element={<CreateIssuePage />} />
          <Route path="/issues/new" element={<CreateIssuePage />} />
          <Route path="/issues/:id" element={<IssueDetailsPage />} />
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
          {/* ================================================== */}
          {/* Activity                                           */}
          {/* ================================================== */}
          <Route path="/activity" element={<ActivityFeedPage />} />
          {/* ================================================== */}
          {/* SETTINGS                                           */}
          {/* ================================================== */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* ====================================================== */}
      {/* FALLBACK ROUTE                                         */}
      {/* ====================================================== */}

      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
};

export default AppRoutes;