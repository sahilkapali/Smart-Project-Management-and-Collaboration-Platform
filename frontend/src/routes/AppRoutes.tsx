import { Routes, Route, Navigate } from "react-router-dom";

// Auth Components
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Main Components
import Dashboard from "../pages/dashboard/Dashboard";
import Profile from "../pages/profile/Profile";
import EditProfile from "../pages/profile/EditProfile";
import ChangePassword from "../pages/profile/ChangePassword";
import Projects from "../pages/projects/Projects";
import ProjectDetails from "../pages/projects/ProjectDetails";
import NotificationsPage from "../pages/notification/NotificationsPage";
import RepositoryPage from "../pages/repository/RepositoryPage";

// Meetings & AI
import MeetingListPage from "../pages/meetings/MeetingListPage";
import CreateMeetingPage from "../pages/meetings/CreateMeetingPage";
import MeetingDetailsPage from "../pages/meetings/MeetingDetailsPage";
import AIPage from "../pages/ai/AIPage";

// Protected Layout / Auth Guard
import ProtectedRoute from "../components/auth/ProtectedRoute";

import { ROUTES } from "../utils/routes";

import SettingsPage from "../pages/settings/SettingsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path={ROUTES.HOME}
        element={<Navigate to={ROUTES.LOGIN} replace />}
      />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

        {/* Profile */}
        <Route path={ROUTES.PROFILE} element={<Profile />} />
        <Route path={ROUTES.EDIT_PROFILE} element={<EditProfile />} />
        <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePassword />} />

        {/* Projects */}
        <Route path={ROUTES.PROJECTS || "/projects"} element={<Projects />} />
        <Route
          path={ROUTES.PROJECT_DETAILS || "/projects/:id"}
          element={<ProjectDetails />}
        />

        {/* Meetings */}
        <Route
          path="/projects/:projectId/meetings"
          element={<MeetingListPage />}
        />
        <Route
          path="/projects/:projectId/meetings/create"
          element={<CreateMeetingPage />}
        />
        <Route path="/meetings/:id" element={<MeetingDetailsPage />} />

        {/* Features */}
        <Route path="/ai" element={<AIPage />} />
        <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
        <Route path={ROUTES.REPOSITORY} element={<RepositoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback for undefined routes */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
};

export default AppRoutes;
