import { createContext, useContext, useEffect, useState } from "react";

import type { ReactNode } from "react";

import { loginUser, registerUser, logoutUser } from "../services/auth.service";

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
  // RESTORE SESSION
  // ==========================================================

  useEffect(() => {
    try {
      const storedToken = getToken();

      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;

        setTokenState(storedToken);

        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to restore authentication session:", error);

      removeToken();

      localStorage.removeItem("user");

      setTokenState(null);

      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (data: LoginData): Promise<User> => {
    const response = await loginUser(data);

    if (!response?.token) {
      throw new Error("Login failed: authentication token was not returned.");
    }

    if (!response?.data) {
      throw new Error("Login failed: user data was not returned.");
    }

    setToken(response.token);

    setTokenState(response.token);

    setUser(response.data);

    localStorage.setItem("user", JSON.stringify(response.data));

    return response.data;
  };

  // ==========================================================
  // REGISTER
  // ==========================================================

  const register = async (data: RegisterData): Promise<User> => {
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

    setUser(response.data);

    localStorage.setItem("user", JSON.stringify(response.data));

    return response.data;
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      removeToken();

      localStorage.removeItem("user");

      setUser(null);

      setTokenState(null);
    }
  };

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value: AuthContextType = {
    user,

    token,

    isAuthenticated: Boolean(token && user),

    loading,

    login,

    register,

    logout,
  };

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
