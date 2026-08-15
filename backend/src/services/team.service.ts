import mongoose from "mongoose";

import Team from "../models/team.models";
import User from "../models/user.models";

import { ITeam } from "../types/team.types";
import { ROLE } from "../types/enum.types";

/**
 * CREATE TEAM
 *
 * Admin and Project Manager can create teams
 * through the route-level authorization.
 *
 * The creator becomes:
 * 1. Team owner
 * 2. First team member
 */
export const createTeam = async (
  name: string,
  description: string | undefined,
  ownerId: string,
): Promise<ITeam> => {
  // Validate owner ID
  if (!mongoose.Types.ObjectId.isValid(ownerId)) {
    throw new Error("Invalid owner ID.");
  }

  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  // Verify owner exists
  const owner = await User.findById(ownerObjectId);

  if (!owner) {
    throw new Error("Team owner not found.");
  }

  // Create team
  const team = new Team({
    name: name.trim(),
    description:
      typeof description === "string" ? description.trim() : undefined,
    owner: ownerObjectId,
    members: [ownerObjectId],
  });

  const savedTeam = await team.save();

  return savedTeam as ITeam;
};

/**
 * GET CURRENT USER TEAMS
 *
 * Returns all teams where the authenticated
 * user is a member.
 */
export const getUserTeams = async (userId: string): Promise<ITeam[]> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const teams = await Team.find({
    members: userObjectId,
  })
    .populate("owner", "firstName lastName email role")
    .populate("members", "firstName lastName email role")
    .sort({ createdAt: -1 });

  return teams as ITeam[];
};

/**
 * GET SINGLE TEAM
 *
 * A user can view a team only if they
 * are a member of that team.
 */
export const getTeamById = async (
  teamId: string,
  userId: string,
): Promise<ITeam> => {
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new Error("Invalid team ID.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  const teamObjectId = new mongoose.Types.ObjectId(teamId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const team = await Team.findOne({
    _id: teamObjectId,
    members: userObjectId,
  })
    .populate("owner", "firstName lastName email role")
    .populate("members", "firstName lastName email role");

  if (!team) {
    throw new Error("Team not found or you are not a member of this team.");
  }

  return team as ITeam;
};

/**
 * ADD MEMBER TO TEAM
 *
 * ADMIN:
 *   Can add members to any team.
 *
 * PROJECT_MANAGER:
 *   Can add members only to their own team.
 *
 * TEAM_MEMBER:
 *   Blocked by route-level authorization.
 */
export const addTeamMember = async (
  teamId: string,
  userId: string,
  requesterId: string,
  requesterRole: ROLE,
): Promise<ITeam> => {
  // Validate Team ID
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new Error("Invalid team ID.");
  }

  // Validate member ID
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  // Validate requester ID
  if (!mongoose.Types.ObjectId.isValid(requesterId)) {
    throw new Error("Invalid requester ID.");
  }

  const teamObjectId = new mongoose.Types.ObjectId(teamId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Find team
  const team = await Team.findById(teamObjectId);

  if (!team) {
    throw new Error("Team not found.");
  }

  /**
   * Authorization
   *
   * Admin can manage any team.
   * Project Manager can manage only their own team.
   */
  if (requesterRole !== ROLE.ADMIN && team.owner.toString() !== requesterId) {
    throw new Error("You do not have permission to add members to this team.");
  }

  // Find user to add
  const user = await User.findById(userObjectId);

  if (!user) {
    throw new Error("User not found.");
  }

  // Check duplicate member
  const alreadyMember = team.members.some(
    (memberId) => memberId.toString() === userId,
  );

  if (alreadyMember) {
    throw new Error("User is already a member of this team.");
  }

  // Add member
  team.members.push(userObjectId);

  await team.save();

  // Return populated team
  const updatedTeam = await Team.findById(team._id)
    .populate("owner", "firstName lastName email role")
    .populate("members", "firstName lastName email role");

  if (!updatedTeam) {
    throw new Error("Team could not be retrieved after adding member.");
  }

  return updatedTeam as ITeam;
};

/**
 * REMOVE MEMBER FROM TEAM
 *
 * ADMIN:
 *   Can remove members from any team.
 *
 * PROJECT_MANAGER:
 *   Can remove members only from their own team.
 *
 * Team owner cannot be removed.
 */
export const removeTeamMember = async (
  teamId: string,
  userId: string,
  requesterId: string,
  requesterRole: ROLE,
): Promise<ITeam> => {
  // Validate Team ID
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new Error("Invalid team ID.");
  }

  // Validate member ID
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  // Validate requester ID
  if (!mongoose.Types.ObjectId.isValid(requesterId)) {
    throw new Error("Invalid requester ID.");
  }

  const teamObjectId = new mongoose.Types.ObjectId(teamId);

  // Find team
  const team = await Team.findById(teamObjectId);

  if (!team) {
    throw new Error("Team not found.");
  }

  /**
   * Authorization
   *
   * Admin can manage any team.
   * Project Manager can manage only their own team.
   */
  if (requesterRole !== ROLE.ADMIN && team.owner.toString() !== requesterId) {
    throw new Error(
      "You do not have permission to remove members from this team.",
    );
  }

  /**
   * Prevent removing team owner.
   */
  if (team.owner.toString() === userId) {
    throw new Error("Team owner cannot be removed from the team.");
  }

  // Check whether user is actually a member
  const isMember = team.members.some(
    (memberId) => memberId.toString() === userId,
  );

  if (!isMember) {
    throw new Error("User is not a member of this team.");
  }

  // Remove member
  team.members = team.members.filter(
    (memberId) => memberId.toString() !== userId,
  );

  await team.save();

  // Return populated team
  const updatedTeam = await Team.findById(team._id)
    .populate("owner", "firstName lastName email role")
    .populate("members", "firstName lastName email role");

  if (!updatedTeam) {
    throw new Error("Team could not be retrieved after removing member.");
  }

  return updatedTeam as ITeam;
};

/**
 * UPDATE TEAM
 *
 * ADMIN:
 *   Can update any team.
 *
 * PROJECT_MANAGER:
 *   Can update only their own team.
 *
 * TEAM_MEMBER:
 *   Blocked by route-level authorization.
 */
export const updateTeam = async (
  teamId: string,
  userId: string,
  userRole: ROLE,
  data: {
    name?: string;
    description?: string;
  },
): Promise<ITeam> => {
  // Validate Team ID
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new Error("Invalid team ID.");
  }

  // Validate User ID
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  const team = await Team.findById(teamId);

  if (!team) {
    throw new Error("Team not found.");
  }

  /**
   * Authorization
   *
   * Admin can update any team.
   * Project Manager can update only their own team.
   */
  if (userRole !== ROLE.ADMIN && team.owner.toString() !== userId) {
    throw new Error("You do not have permission to update this team.");
  }

  // Update name
  if (data.name !== undefined) {
    const name = data.name.trim();

    if (name.length < 3) {
      throw new Error("Team name must be at least 3 characters long.");
    }

    if (name.length > 100) {
      throw new Error("Team name cannot exceed 100 characters.");
    }

    team.name = name;
  }

  // Update description
  if (data.description !== undefined) {
    team.description = data.description.trim();
  }

  await team.save();

  // Return populated team
  const updatedTeam = await Team.findById(team._id)
    .populate("owner", "firstName lastName email role")
    .populate("members", "firstName lastName email role");

  if (!updatedTeam) {
    throw new Error("Team could not be retrieved after updating.");
  }

  return updatedTeam as ITeam;
};

/**
 * DELETE TEAM
 *
 * ADMIN:
 *   Can delete any team.
 *
 * PROJECT_MANAGER:
 *   Can delete only their own team.
 *
 * TEAM_MEMBER:
 *   Blocked by route-level authorization.
 */
export const deleteTeam = async (
  teamId: string,
  userId: string,
  userRole: ROLE,
): Promise<void> => {
  // Validate Team ID
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new Error("Invalid team ID.");
  }

  // Validate User ID
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  const team = await Team.findById(teamId);

  if (!team) {
    throw new Error("Team not found.");
  }

  /**
   * Authorization
   *
   * Admin can delete any team.
   * Project Manager can delete only their own team.
   */
  if (userRole !== ROLE.ADMIN && team.owner.toString() !== userId) {
    throw new Error("You do not have permission to delete this team.");
  }

  await Team.findByIdAndDelete(teamId);
};
