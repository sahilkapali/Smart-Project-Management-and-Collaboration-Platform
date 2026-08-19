import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

/**
 * ============================================================
 * API BASE URL
 * ============================================================
 *
 * Development:
 * http://localhost:5000/api
 *
 * Production:
 * Render backend URL
 *
 * Example:
 * https://smart-project-backend.onrender.com/api
 *
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * ============================================================
 * AXIOS INSTANCE
 * ============================================================
 */

const api = axios.create({
  baseURL: API_URL,

  // Required because backend uses cookies
  withCredentials: true,

  timeout: 30000,
});

/**
 * ============================================================
 * REQUEST INTERCEPTOR
 * ============================================================
 */

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    /**
     * JWT token
     */
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /**
     * FormData handling
     */
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },

  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/**
 * ============================================================
 * RESPONSE INTERCEPTOR
 * ============================================================
 */

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error: AxiosError) => {
    if (error.response) {
      console.log("API ERROR:", error.response.status, error.response.data);
    } else {
      console.log("NETWORK ERROR:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
