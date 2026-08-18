import axios from "axios";

/**
 * ============================================================
 * API URL
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
  timeout: 30000,

  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * ============================================================
 * REQUEST INTERCEPTOR
 * ============================================================
 */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    console.log("==========================================");
    console.log("API REQUEST");
    console.log("URL:", `${config.baseURL}${config.url}`);
    console.log("METHOD:", config.method);
    console.log("TOKEN EXISTS:", Boolean(token));
    console.log("TOKEN:", token ? `${token.substring(0, 20)}...` : "NONE");
    console.log("==========================================");

    if (token) {
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
 */

api.interceptors.response.use(
  (response) => {
    console.log("==========================================");
    console.log("API SUCCESS");
    console.log("URL:", response.config.url);
    console.log("STATUS:", response.status);
    console.log("DATA:", response.data);
    console.log("==========================================");

    return response;
  },

  (error) => {
    const status = error?.response?.status;

    console.log("==========================================");
    console.log("API ERROR");
    console.log("URL:", error?.config?.url);
    console.log("METHOD:", error?.config?.method);
    console.log("STATUS:", status);
    console.log("RESPONSE:", error?.response?.data);
    console.log("==========================================");

    if (status === 401) {
      console.warn("401 Unauthorized detected.");

      /*
       * IMPORTANT:
       *
       * We are temporarily NOT redirecting to login here.
       *
       * This allows us to see which API request is actually
       * failing.
       */

      // DO NOT CLEAR TOKEN FOR NOW
      // DO NOT REDIRECT TO LOGIN FOR NOW
    }

    return Promise.reject(error);
  },
);

export default api;
