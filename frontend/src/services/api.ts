import axios from "axios";
<<<<<<< HEAD
=======

>>>>>>> origin/main
import { getToken, removeToken } from "../utils/auth";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

/**
 * Attach JWT token to every authenticated request.
 */
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Do not manually set Content-Type for FormData.
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

<<<<<<< HEAD
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();

=======
/**
 * Handle authentication errors globally.
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Remove invalid/expired authentication data
      removeToken();
      localStorage.removeItem("user");

      // Avoid redirecting repeatedly if already on login
>>>>>>> origin/main
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

<<<<<<< HEAD
export default api;
=======
export default api;
>>>>>>> origin/main
