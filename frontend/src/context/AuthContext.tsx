import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import { loginUser, registerUser, logoutUser } from "../services/auth.service";

import { getUserProfile } from "../services/user.service";

import type { LoginData, RegisterData, User } from "../types/user.types";

import { getToken, removeToken, setToken } from "../utils/auth";

// ============================================================
// AUTH CONTEXT TYPE
// ============================================================

interface AuthContextType {
  user: User | null;

  token: string | null;

  isAuthenticated: boolean;

  loading: boolean;

  login: (data: LoginData) => Promise<User>;

  register: (data: RegisterData) => Promise<User>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<User | null>;
}

// ============================================================
// CREATE CONTEXT
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// PROVIDER PROPS
// ============================================================

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================
// AUTH PROVIDER
// ============================================================

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const [token, setTokenState] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  // ==========================================================
  // SAVE USER
  // ==========================================================

  const saveUser = useCallback((userData: User) => {
    setUser(userData);

    /*
     * localStorage is only used for persistence/UI convenience.
     *
     * The backend remains the source of truth for the
     * authenticated user's role and account state.
     */
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  // ==========================================================
  // CLEAR SESSION
  // ==========================================================

  const clearSession = useCallback(() => {
    removeToken();

    localStorage.removeItem("user");

    setTokenState(null);

    setUser(null);
  }, []);

  // ==========================================================
  // REFRESH USER
  // ==========================================================
  //
  // Always retrieves the current user from the backend.
  //
  // This is important because an administrator may change:
  //
  // - role
  // - profile
  // - active status
  //
  // The frontend must not rely on stale localStorage data.
  //
  // ==========================================================

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const storedToken = getToken();

    if (!storedToken) {
      clearSession();

      return null;
    }

    try {
      const response = await getUserProfile();

      /*
       * Some service implementations return the User
       * directly while others may return response.data.
       *
       * Your current user.service returns User, so this
       * remains the expected path.
       */

      const currentUser = response;

      if (!currentUser) {
        throw new Error("User profile was not returned by the server.");
      }

      saveUser(currentUser);

      setTokenState(storedToken);

      return currentUser;
    } catch (error) {
      console.error("Failed to refresh authenticated user:", error);

      clearSession();

      return null;
    }
  }, [clearSession, saveUser]);

  // ==========================================================
  // RESTORE SESSION
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const storedToken = getToken();

      /*
       * No token means there is no authenticated session.
       */

      if (!storedToken) {
        if (mounted) {
          setTokenState(null);
          setUser(null);
          setLoading(false);
        }

        return;
      }

      try {
        /*
         * We deliberately do NOT restore the user from
         * localStorage as the source of truth.
         *
         * Instead, the JWT is verified through the backend
         * profile endpoint.
         */

        const currentUser = await getUserProfile();

        if (!mounted) {
          return;
        }

        if (!currentUser) {
          throw new Error("Authenticated user profile was not returned.");
        }

        setTokenState(storedToken);

        saveUser(currentUser);
      } catch (error) {
        console.error("Failed to restore authentication session:", error);

        if (mounted) {
          clearSession();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, [clearSession, saveUser]);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = useCallback(
    async (data: LoginData): Promise<User> => {
      /*
       * During login, the backend returns:
       *
       * {
       *   success,
       *   message,
       *   token,
       *   data: User
       * }
       */

      const response = await loginUser(data);

      // ------------------------------------------------------
      // Validate authentication token
      // ------------------------------------------------------

      if (!response?.token) {
        throw new Error("Login failed: authentication token was not returned.");
      }

      // ------------------------------------------------------
      // Validate authenticated user
      // ------------------------------------------------------

      if (!response?.data) {
        throw new Error("Login failed: user data was not returned.");
      }

      // ------------------------------------------------------
      // Store JWT
      // ------------------------------------------------------

      setToken(response.token);

      setTokenState(response.token);

      // ------------------------------------------------------
      // Store user
      // ------------------------------------------------------

      saveUser(response.data);

      return response.data;
    },
    [saveUser],
  );

  // ==========================================================
  // REGISTER
  // ==========================================================

  const register = useCallback(
    async (data: RegisterData): Promise<User> => {
      /*
       * The backend automatically assigns:
       *
       * TEAM_MEMBER
       *
       * during public registration.
       *
       * The frontend does not send a role.
       */

      const response = await registerUser(data);

      // ------------------------------------------------------
      // Validate authentication token
      // ------------------------------------------------------

      if (!response?.token) {
        throw new Error(
          "Registration failed: authentication token was not returned.",
        );
      }

      // ------------------------------------------------------
      // Validate user
      // ------------------------------------------------------

      if (!response?.data) {
        throw new Error("Registration failed: user data was not returned.");
      }

      // ------------------------------------------------------
      // Store JWT
      // ------------------------------------------------------

      setToken(response.token);

      setTokenState(response.token);

      // ------------------------------------------------------
      // Store user
      // ------------------------------------------------------

      saveUser(response.data);

      return response.data;
    },
    [saveUser],
  );

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = useCallback(async (): Promise<void> => {
    try {
      /*
       * Attempt to notify the backend first.
       *
       * Even if this request fails, local authentication
       * state is always cleared.
       */

      await logoutUser();
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = useMemo<AuthContextType>(
    () => ({
      user,

      token,

      isAuthenticated: Boolean(token && user),

      loading,

      login,

      register,

      logout,

      refreshUser,
    }),
    [user, token, loading, login, register, logout, refreshUser],
  );

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================
// USE AUTH HOOK
// ============================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
