import type { User, UserRole } from "../types/user.types";

export const ROLES = {
  ADMIN: "ADMIN" as UserRole,
  PROJECT_MANAGER: "PROJECT_MANAGER" as UserRole,
  TEAM_MEMBER: "TEAM_MEMBER" as UserRole,
} as const;

/**
 * Roles that have management-level access.
 */
export const MANAGEMENT_ROLES: UserRole[] = [
  ROLES.ADMIN,
  ROLES.PROJECT_MANAGER,
];

/**
 * All supported application roles.
 */
export const ALL_ROLES: UserRole[] = [
  ROLES.ADMIN,
  ROLES.PROJECT_MANAGER,
  ROLES.TEAM_MEMBER,
];

/**
 * Check whether the current user is an administrator.
 */
export const isAdmin = (user: User | null): boolean => {
  return user?.role === ROLES.ADMIN;
};

/**
 * Check whether the current user is a project manager.
 */
export const isProjectManager = (user: User | null): boolean => {
  return user?.role === ROLES.PROJECT_MANAGER;
};

/**
 * Check whether the current user is a team member.
 */
export const isTeamMember = (user: User | null): boolean => {
  return user?.role === ROLES.TEAM_MEMBER;
};

/**
 * Check whether the user has one of the supplied roles.
 */
export const hasRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user) {
    return false;
  }

  return roles.includes(user.role);
};

/**
 * Check whether the user has a management role.
 */
export const isManagement = (user: User | null): boolean => {
  return hasRole(user, MANAGEMENT_ROLES);
};
