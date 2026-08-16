import type { User, UserRole } from "../types/user.types";

export const ROLES = {
  ADMIN: "ADMIN" as UserRole,
  PROJECT_MANAGER: "PROJECT_MANAGER" as UserRole,
  TEAM_MEMBER: "TEAM_MEMBER" as UserRole,
} as const;

export const isAdmin = (user: User | null): boolean => {
  return user?.role === ROLES.ADMIN;
};

export const isProjectManager = (user: User | null): boolean => {
  return user?.role === ROLES.PROJECT_MANAGER;
};

export const isTeamMember = (user: User | null): boolean => {
  return user?.role === ROLES.TEAM_MEMBER;
};

export const hasRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user) {
    return false;
  }

  return roles.includes(user.role);
};
