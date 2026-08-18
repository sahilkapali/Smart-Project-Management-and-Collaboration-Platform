import axios from "axios";

/**
 * Backend API URL
 *
 * VITE_API_URL should normally be:
 *
 * http://localhost:8080/api
 *
 * If it is not defined, the application will use
 * the local backend URL above.
 */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/**
 * Axios API client
 */
const api = axios.create({
  baseURL: API_URL,

  /*
   * Keep this enabled because the backend supports
   * credentials/cookies as well.
   */
  withCredentials: true,

  timeout: 30000,

  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * ============================================================
 * REQUEST INTERCEPTOR
 * ============================================================
 *
 * IMPORTANT:
 *
 * AuthContext stores the JWT using:
 *
 *     localStorage.setItem("accessToken", token)
 *
 * Therefore we MUST read "accessToken" here.
 *
 * The previous implementation incorrectly read:
 *
 *     localStorage.getItem("token")
 *
 * which caused authenticated requests to be sent without
 * the Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      /*
       * Axios 1.x supports AxiosHeaders.set().
       *
       * We also make sure headers exists before setting it.
       */
      if (config.headers) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

/**
 * ============================================================
 * RESPONSE INTERCEPTOR
 * ============================================================
 *
 * Handles expired/invalid authentication.
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn(
        "Authentication failed: JWT is missing, invalid, or expired.",
      );

      const currentPath = window.location.pathname;

      const authPages = [
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
      ];

      const isAuthPage = authPages.includes(currentPath);

      if (!isAuthPage) {
        /*
         * Remove BOTH keys.
         *
         * "accessToken" is the current correct key.
         *
         * "token" is removed as a compatibility cleanup in
         * case an older version of the application stored it.
         */
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
