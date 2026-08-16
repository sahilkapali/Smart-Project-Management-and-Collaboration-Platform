import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { loginUser, registerUser, logoutUser } from "../services/auth.service";

import type { LoginData, RegisterData, User } from "../types/user.types";

import { getToken, removeToken, setToken } from "../utils/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (data: LoginData) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const [token, setTokenState] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  // ==================== RESTORE SESSION ====================

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);

        setTokenState(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to restore authentication session:", error);

        removeToken();
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  // ==================== LOGIN ====================

  const login = async (data: LoginData): Promise<User> => {
    const response = await loginUser(data);

    setToken(response.token);
    setTokenState(response.token);

    setUser(response.data);

    localStorage.setItem("user", JSON.stringify(response.data));

    return response.data;
  };

  // ==================== REGISTER ====================

  const register = async (data: RegisterData): Promise<User> => {
    const response = await registerUser(data);

    setToken(response.token);
    setTokenState(response.token);

    setUser(response.data);

    localStorage.setItem("user", JSON.stringify(response.data));

    return response.data;
  };

  // ==================== LOGOUT ====================

  const logout = async (): Promise<void> => {
    try {
      /*
       * Call backend logout endpoint first.
       *
       * The JWT is automatically attached by
       * the Axios interceptor in api.ts.
       */
      await logoutUser();
    } catch (error) {
      /*
       * Even if the backend request fails,
       * we still remove the local authentication
       * information.
       */
      console.error("Backend logout failed:", error);
    } finally {
      /*
       * Always clear local authentication state.
       */
      removeToken();

      localStorage.removeItem("user");

      setUser(null);
      setTokenState(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ==================== USE AUTH ====================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};
