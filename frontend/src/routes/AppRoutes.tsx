import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import Dashboard from "../pages/dashboard/Dashboard";

import Profile from "../pages/profile/Profile";
import EditProfile from "../pages/profile/EditProfile";
import ChangePassword from "../pages/profile/ChangePassword";

import ProtectedRoute from "../components/auth/ProtectedRoute";

import MeetingListPage from "../pages/meetings/MeetingListPage";
import CreateMeetingPage from "../pages/meetings/CreateMeetingPage";
import MeetingDetailsPage from "../pages/meetings/MeetingDetailsPage";

import AIPage from "../pages/ai/AIPage";

import { ROUTES } from "../utils/routes";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}

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

      {/* Protected routes */}

      <Route element={<ProtectedRoute />}>
        <Route
          path={ROUTES.DASHBOARD}
          element={<Dashboard />}
        />

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

        {/* Meeting routes */}

        <Route
          path="/projects/:projectId/meetings"
          element={<MeetingListPage />}
        />

        <Route
          path="/projects/:projectId/meetings/create"
          element={<CreateMeetingPage />}
        />

        <Route
          path="/meetings/:id"
          element={<MeetingDetailsPage />}
        />

        {/* AI */}

        <Route
          path="/ai"
          element={<AIPage />}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;