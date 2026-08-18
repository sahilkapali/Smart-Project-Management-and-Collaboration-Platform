import axios from "axios";

import { getToken, removeToken } from "../utils/auth";

// ============================================================
// AXIOS API CLIENT
// ============================================================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",

  withCredentials: true,

  timeout: 15000,
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================
//
// Automatically attaches JWT:
//
// Authorization: Bearer <token>
//
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    // --------------------------------------------------------
    // Attach JWT
    // --------------------------------------------------------

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // --------------------------------------------------------
    // Content-Type
    // --------------------------------------------------------
    //
    // Do not manually set Content-Type for FormData.
    // Axios/browser automatically creates the correct
    // multipart boundary.
    //

    if (config.data && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================
//
// 401 = authentication failure
//
// 403 = authenticated but unauthorized
//
// We only clear authentication on 401.
//
// ============================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error.response?.status;

    // ========================================================
    // 401 UNAUTHORIZED
    // ========================================================

    if (status === 401) {
      removeToken();

      localStorage.removeItem("user");

      const currentPath = window.location.pathname;

      const publicRoutes = [
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
      ];

      // ------------------------------------------------------
      // Prevent redirect loop
      // ------------------------------------------------------

      if (!publicRoutes.includes(currentPath)) {
        window.location.href = "/login";
      }
    }

    // ========================================================
    // 403 FORBIDDEN
    // ========================================================
    //
    // Do NOT remove token.
    //
    // The user is authenticated but doesn't have
    // permission for the requested operation.
    //

    return Promise.reject(error);
  },
);

// ============================================================
// EXPORT
// ============================================================

export default api;
