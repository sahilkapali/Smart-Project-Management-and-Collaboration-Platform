import api from "./api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  first_Name: string;
  last_Name: string;
  email: string;
  password: string;
}

export const login = async (data: LoginData) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const register = async (data: RegisterData) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await api.put("/users/profile", data);
  return response.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await api.put("/users/change-password", data);
  return response.data;
};