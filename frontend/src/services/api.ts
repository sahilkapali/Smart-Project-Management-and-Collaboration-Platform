import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

/**
 * ============================================================
 * API CONFIGURATION
 * ============================================================
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/**
 * ============================================================
 * AXIOS INSTANCE
 * ============================================================
 */

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30_000,
});

/**
 * ============================================================
 * REQUEST INTERCEPTOR
 * ============================================================
 */

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // --------------------------------------------------------
    // Authentication token
    // --------------------------------------------------------

    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    // --------------------------------------------------------
    // FormData requests
    // --------------------------------------------------------
    //
    // IMPORTANT:
    // Do NOT manually set Content-Type for FormData.
    //
    // The browser/Axios will automatically generate:
    //
    // multipart/form-data; boundary=...
    //
    // --------------------------------------------------------

    if (config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    } else {
      // ------------------------------------------------------
      // Normal JSON requests
      // ------------------------------------------------------

      config.headers.set("Content-Type", "application/json");
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
  (response) => response,

  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/**
 * ============================================================
 * EXPORT
 * ============================================================
 */

export default api;
