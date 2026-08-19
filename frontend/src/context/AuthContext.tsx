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

import {
  getUserProfile,
  updateUserProfile as updateUserProfileApi,
} from "../services/user.service";

import type {
  LoginData,
  RegisterData,
  User,
  UpdateProfileData,
} from "../types/user.types";

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

  updateUserProfile: (data: UpdateProfileData) => Promise<User>;
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
  // UPDATE CURRENT USER PROFILE
  // ==========================================================

  const updateUserProfile = useCallback(
    async (data: UpdateProfileData): Promise<User> => {
      const updatedUser = await updateUserProfileApi(data);

      if (!updatedUser) {
        throw new Error(
          "Profile update failed: updated user was not returned.",
        );
      }

      // Update React state
      saveUser(updatedUser);

      return updatedUser;
    },
    [saveUser],
  );

  // ==========================================================
  // REFRESH CURRENT USER
  // ==========================================================

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const storedToken = getToken();

    if (!storedToken) {
      clearSession();

      return null;
    }

    try {
      const currentUser = await getUserProfile();

      if (!currentUser) {
        throw new Error("User profile was not returned by the server.");
      }

      setTokenState(storedToken);

      saveUser(currentUser);

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
      try {
        const storedToken = getToken();

        if (!storedToken) {
          if (mounted) {
            setTokenState(null);
            setUser(null);
          }

          return;
        }

        if (mounted) {
          setTokenState(storedToken);
        }

        const currentUser = await getUserProfile();

        if (!mounted) {
          return;
        }

        if (!currentUser) {
          throw new Error("Authenticated user profile was not returned.");
        }

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
      const response = await loginUser(data);

      if (!response?.token) {
        throw new Error("Login failed: authentication token was not returned.");
      }

      if (!response?.data) {
        throw new Error("Login failed: user data was not returned.");
      }

      setToken(response.token);

      setTokenState(response.token);

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
      const response = await registerUser(data);

      if (!response?.token) {
        throw new Error(
          "Registration failed: authentication token was not returned.",
        );
      }

      if (!response?.data) {
        throw new Error("Registration failed: user data was not returned.");
      }

      setToken(response.token);

      setTokenState(response.token);

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
      await logoutUser();
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // ==========================================================
  // AUTHENTICATION STATE
  // ==========================================================

  const isAuthenticated = Boolean(token && user);

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = useMemo<AuthContextType>(
    () => ({
      user,

      token,

      isAuthenticated,

      loading,

      login,

      register,

      logout,

      refreshUser,

      updateUserProfile,
    }),
    [
      user,
      token,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      refreshUser,
      updateUserProfile,
    ],
  );

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================
// USE AUTH
// ============================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
