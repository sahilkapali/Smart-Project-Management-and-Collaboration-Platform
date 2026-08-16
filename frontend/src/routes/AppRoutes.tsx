import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// ==================== AUTH PAGES ====================

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// ==================== DASHBOARD ====================

import Dashboard from "../pages/dashboard/Dashboard";

// ==================== PROFILE ====================

import Profile from "../pages/profile/Profile";
import EditProfile from "../pages/profile/EditProfile";
import ChangePassword from "../pages/profile/ChangePassword";

// ==================== OTHER PAGES ====================

import NotificationsPage from "../pages/notification/NotificationsPage";
import RepositoryPage from "../pages/repository/RepositoryPage";

import MeetingListPage from "../pages/meetings/MeetingListPage";
import CreateMeetingPage from "../pages/meetings/CreateMeetingPage";
import MeetingDetailsPage from "../pages/meetings/MeetingDetailsPage";

import AIPage from "../pages/ai/AIPage";

// ==================== ROUTE COMPONENTS ====================

import ProtectedRoute from "../components/auth/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";

// ==================== ROUTE CONSTANTS ====================

import { ROUTES } from "../utils/routes";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ================================================== */}
      {/* PUBLIC ROUTES                                      */}
      {/* ================================================== */}

      <Route
        path={ROUTES.HOME}
        element={<Navigate to={ROUTES.LOGIN} replace />}
      />

      <Route path={ROUTES.LOGIN} element={<Login />} />

      <Route path={ROUTES.REGISTER} element={<Register />} />

      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />

      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

      {/* ================================================== */}
      {/* PROTECTED ROUTES                                   */}
      {/* ================================================== */}

      <Route element={<ProtectedRoute />}>
        {/* ================================================== */}
        {/* MAIN LAYOUT                                        */}
        {/* ================================================== */}

        <Route
          element={
            <MainLayout>
              <Outlet />
            </MainLayout>
          }
        >
          {/* ==================== DASHBOARD ==================== */}

          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

          {/* ==================== PROFILE ==================== */}

          <Route path={ROUTES.PROFILE} element={<Profile />} />

          {/* ==================== EDIT PROFILE ==================== */}

          <Route path={ROUTES.EDIT_PROFILE} element={<EditProfile />} />

          {/* ==================== CHANGE PASSWORD ==================== */}

          <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePassword />} />

          {/* ==================== NOTIFICATIONS ==================== */}

          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />

          {/* ==================== REPOSITORY ==================== */}

          <Route path={ROUTES.REPOSITORY} element={<RepositoryPage />} />

          {/* ==================== MEETINGS ==================== */}

          <Route
            path="/projects/:projectId/meetings"
            element={<MeetingListPage />}
          />

          <Route
            path="/projects/:projectId/meetings/create"
            element={<CreateMeetingPage />}
          />

          <Route path="/meetings/:id" element={<MeetingDetailsPage />} />

          {/* ==================== AI ==================== */}

          <Route path="/ai" element={<AIPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
