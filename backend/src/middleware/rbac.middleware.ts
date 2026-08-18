import { Request, Response, NextFunction } from "express";

import { ROLE } from "../types/enum.types";

/**
 * ============================================================
 * RBAC MIDDLEWARE
 * ============================================================
 *
 * Authentication and authorization are different things.
 *
 * authenticateUser()
 * ------------------
 * Verifies that the user has a valid JWT.
 *
 * authorizeRoles()
 * ----------------
 * Verifies that the authenticated user's role is allowed
 * to access the endpoint.
 *
 * IMPORTANT:
 *
 * Frontend role checks are ONLY for UI.
 *
 * The backend must always enforce authorization.
 */

/**
 * ============================================================
 * AUTHORIZE ROLES
 * ============================================================
 *
 * Example:
 *
 * router.post(
 *   "/",
 *   authenticateUser(),
 *   authorizeRoles(ROLE.ADMIN, ROLE.PROJECT_MANAGER),
 *   createProject,
 * );
 *
 * Only ADMIN and PROJECT_MANAGER can access the endpoint.
 */

export const authorizeRoles = (...allowedRoles: ROLE[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // --------------------------------------------------------
      // Make sure authentication middleware ran first.
      // --------------------------------------------------------

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Authentication is required.",
        });
      }

      // --------------------------------------------------------
      // Get authenticated user's role
      // --------------------------------------------------------

      const userRole = req.user.role;

      // --------------------------------------------------------
      // Make sure the role exists.
      // --------------------------------------------------------

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: "Access denied. User role is missing.",
        });
      }

      // --------------------------------------------------------
      // Check permission
      // --------------------------------------------------------

      if (!allowedRoles.includes(userRole as ROLE)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not have permission.",
        });
      }

      // --------------------------------------------------------
      // Authorized
      // --------------------------------------------------------

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * ============================================================
 * ROLE HELPERS
 * ============================================================
 *
 * These helpers are useful inside controllers/services when
 * authorization depends on more than just the route.
 */

/**
 * Check whether user is an Admin.
 */
export const isAdmin = (req: Request): boolean => {
  return req.user?.role === ROLE.ADMIN;
};

/**
 * Check whether user is a Project Manager.
 */
export const isProjectManager = (req: Request): boolean => {
  return req.user?.role === ROLE.PROJECT_MANAGER;
};

/**
 * Check whether user is a Team Member.
 */
export const isTeamMember = (req: Request): boolean => {
  return req.user?.role === ROLE.TEAM_MEMBER;
};

/**
 * Check whether user is Admin or Project Manager.
 */
export const isManager = (req: Request): boolean => {
  return (
    req.user?.role === ROLE.ADMIN || req.user?.role === ROLE.PROJECT_MANAGER
  );
};
