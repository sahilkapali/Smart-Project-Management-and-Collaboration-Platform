import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/custom";
import * as teamService from "../services/team.service";

/**
 * CREATE TEAM
 *
 * Allowed roles are controlled by team.routes.ts:
 * - ADMIN
 * - PROJECT_MANAGER
 *
 * The authenticated user becomes:
 * - Team owner
 * - First team member
 */
export const handleCreateTeam = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized. User information is missing.",
        data: null,
      });
      return;
    }

    const { name, description } = req.body;

    // Validate name
    if (!name || typeof name !== "string") {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Team name is required and must be a string.",
        data: null,
      });
      return;
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 3) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Team name must be at least 3 characters long.",
        data: null,
      });
      return;
    }

    if (trimmedName.length > 100) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Team name cannot exceed 100 characters.",
        data: null,
      });
      return;
    }

    // Validate description
    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Description must be a string if provided.",
        data: null,
      });
      return;
    }

    const formattedDescription =
      typeof description === "string" ? description.trim() : undefined;

    const team = await teamService.createTeam(
      trimmedName,
      formattedDescription,
      userId,
    );

    res.status(201).json({
      success: true,
      message: "Team created successfully.",
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET CURRENT USER TEAMS
 *
 * Returns all teams where the authenticated
 * user is a member.
 *
 * Allowed:
 * - ADMIN
 * - PROJECT_MANAGER
 * - TEAM_MEMBER
 */
export const handleGetTeams = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized. User information is missing.",
        data: null,
      });
      return;
    }

    const teams = await teamService.getUserTeams(userId);

    res.status(200).json({
      success: true,
      message: "Teams fetched successfully.",
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET SINGLE TEAM
 *
 * The service determines whether the authenticated
 * user can access the requested team.
 */
export const handleGetTeamById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { teamId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized. User information is missing.",
        data: null,
      });
      return;
    }

    if (!teamId) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Team ID is required.",
        data: null,
      });
      return;
    }

    const team = await teamService.getTeamById(teamId, userId);

    res.status(200).json({
      success: true,
      message: "Team fetched successfully.",
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ADD MEMBER TO TEAM
 *
 * Request body:
 * {
 *   "userId": "USER_ID"
 * }
 *
 * Authorization:
 * - ADMIN can add to any team.
 * - PROJECT_MANAGER can add to their own team.
 * - TEAM_MEMBER is blocked by route middleware.
 */
export const handleAddTeamMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    const { teamId } = req.params;
    const { userId } = req.body;

    if (!requesterId || !requesterRole) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized. User information is missing.",
        data: null,
      });
      return;
    }

    if (!teamId) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Team ID is required.",
        data: null,
      });
      return;
    }

    if (!userId) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "User ID is required.",
        data: null,
      });
      return;
    }

    const team = await teamService.addTeamMember(
      teamId,
      userId,
      requesterId,
      requesterRole,
    );

    res.status(200).json({
      success: true,
      message: "Team member added successfully.",
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * REMOVE MEMBER FROM TEAM
 *
 * URL:
 * DELETE /api/teams/:teamId/members/:userId
 *
 * Authorization:
 * - ADMIN can remove from any team.
 * - PROJECT_MANAGER can remove from their own team.
 * - TEAM_MEMBER is blocked by route middleware.
 *
 * Team owner cannot be removed.
 */
export const handleRemoveTeamMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    const { teamId, userId } = req.params;

    if (!requesterId || !requesterRole) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized. User information is missing.",
        data: null,
      });
      return;
    }

    if (!teamId) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Team ID is required.",
        data: null,
      });
      return;
    }

    if (!userId) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "User ID is required.",
        data: null,
      });
      return;
    }

    const team = await teamService.removeTeamMember(
      teamId,
      userId,
      requesterId,
      requesterRole,
    );

    res.status(200).json({
      success: true,
      message: "Team member removed successfully.",
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE TEAM
 *
 * Request body can contain:
 * {
 *   "name": "New Team Name",
 *   "description": "New description"
 * }
 *
 * At least one field must be provided.
 *
 * Authorization:
 * - ADMIN can update any team.
 * - PROJECT_MANAGER can update their own team.
 */
export const handleUpdateTeam = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { teamId } = req.params;
    const { name, description } = req.body;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized. User information is missing.",
        data: null,
      });
      return;
    }

    if (!teamId) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Team ID is required.",
        data: null,
      });
      return;
    }

    // At least one field must be provided
    if (name === undefined && description === undefined) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "At least one field is required to update the team.",
        data: null,
      });
      return;
    }

    // Validate name
    if (name !== undefined) {
      if (typeof name !== "string") {
        res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "Team name must be a string.",
          data: null,
        });
        return;
      }

      const trimmedName = name.trim();

      if (trimmedName.length < 3) {
        res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "Team name must be at least 3 characters long.",
          data: null,
        });
        return;
      }

      if (trimmedName.length > 100) {
        res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "Team name cannot exceed 100 characters.",
          data: null,
        });
        return;
      }
    }

    // Validate description
    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Description must be a string.",
        data: null,
      });
      return;
    }

    const team = await teamService.updateTeam(teamId, userId, userRole, {
      name: typeof name === "string" ? name.trim() : undefined,

      description:
        typeof description === "string" ? description.trim() : undefined,
    });

    res.status(200).json({
      success: true,
      message: "Team updated successfully.",
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE TEAM
 *
 * Authorization:
 * - ADMIN can delete any team.
 * - PROJECT_MANAGER can delete their own team.
 * - TEAM_MEMBER is blocked by route middleware.
 */
export const handleDeleteTeam = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { teamId } = req.params;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized. User information is missing.",
        data: null,
      });
      return;
    }

    if (!teamId) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Team ID is required.",
        data: null,
      });
      return;
    }

    await teamService.deleteTeam(teamId, userId, userRole);

    res.status(200).json({
      success: true,
      message: "Team deleted successfully.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
