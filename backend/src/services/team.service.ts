import mongoose from "mongoose";

import Team from "../models/team.models";
import User from "../models/user.models";

import { ITeam } from "../types/team.types";
import { ROLE } from "../types/enum.types";

const populateTeam = async (teamId: mongoose.Types.ObjectId) => {
  const team = await Team.findById(teamId)
    .populate("owner", "firstName lastName email role")
    .populate("members", "firstName lastName email role");

  if (!team) {
    throw new Error("Team could not be retrieved.");
  }

  return team;
};

/**
 * Check whether a user can manage a team.
 *
 * ADMIN:
 *   Can manage any team.
 *
 * PROJECT_MANAGER:
 *   Can manage only their own team.
 */
const canManageTeam = (
  teamOwnerId: mongoose.Types.ObjectId,
  requesterId: string,
  requesterRole: ROLE,
): boolean => {
  if (requesterRole === ROLE.ADMIN) {
    return true;
  }

  if (
    requesterRole === ROLE.PROJECT_MANAGER &&
    teamOwnerId.toString() === requesterId
  ) {
    return true;
  }

  return false;
};

/**
 * CREATE TEAM
 */
export const createTeam = async (
  name: string,
  description: string | undefined,
  ownerId: string,
): Promise<ITeam> => {
  if (!mongoose.Types.ObjectId.isValid(ownerId)) {
    throw new Error("Invalid owner ID.");
  }

  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  const owner = await User.findById(ownerObjectId);

  if (!owner) {
    throw new Error("Team owner not found.");
  }

  const team = new Team({
    name: name.trim(),
    description:
      typeof description === "string" ? description.trim() : undefined,
    owner: ownerObjectId,
    members: [ownerObjectId],
  });

  return (await team.save()) as ITeam;
};

/**
 * GET CURRENT USER TEAMS
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

  const team = await Team.findOne({
    _id: teamId,
    members: userId,
  })
    .populate("owner", "firstName lastName email role")
    .populate("members", "firstName lastName email role");

  if (!team) {
    throw new Error("Team not found or you are not a member of this team.");
  }

  return team as ITeam;
};

/**
 * ADD MEMBER
 */
export const addTeamMember = async (
  teamId: string,
  userId: string,
  requesterId: string,
  requesterRole: ROLE,
): Promise<ITeam> => {
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new Error("Invalid team ID.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  if (!mongoose.Types.ObjectId.isValid(requesterId)) {
    throw new Error("Invalid requester ID.");
  }

  const team = await Team.findById(teamId);

  if (!team) {
    throw new Error("Team not found.");
  }

  // Authorization
  if (!canManageTeam(team.owner, requesterId, requesterRole)) {
    throw new Error("You do not have permission to add members to this team.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  const alreadyMember = team.members.some(
    (memberId) => memberId.toString() === userId,
  );

  if (alreadyMember) {
    throw new Error("User is already a member of this team.");
  }

  team.members.push(new mongoose.Types.ObjectId(userId));

  await team.save();

  return (await populateTeam(team._id)) as ITeam;
};

/**
 * REMOVE MEMBER
 */
export const removeTeamMember = async (
  teamId: string,
  userId: string,
  requesterId: string,
  requesterRole: ROLE,
): Promise<ITeam> => {
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new Error("Invalid team ID.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  if (!mongoose.Types.ObjectId.isValid(requesterId)) {
    throw new Error("Invalid requester ID.");
  }

  const team = await Team.findById(teamId);

  if (!team) {
    throw new Error("Team not found.");
  }

  // Authorization
  if (!canManageTeam(team.owner, requesterId, requesterRole)) {
    throw new Error(
      "You do not have permission to remove members from this team.",
    );
  }

  // Owner cannot be removed
  if (team.owner.toString() === userId) {
    throw new Error("Team owner cannot be removed from the team.");
  }

  const isMember = team.members.some(
    (memberId) => memberId.toString() === userId,
  );

  if (!isMember) {
    throw new Error("User is not a member of this team.");
  }

  team.members = team.members.filter(
    (memberId) => memberId.toString() !== userId,
  );

  await team.save();

  return (await populateTeam(team._id)) as ITeam;
};

/**
 * UPDATE TEAM
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
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new Error("Invalid team ID.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  const team = await Team.findById(teamId);

  if (!team) {
    throw new Error("Team not found.");
  }

  if (!canManageTeam(team.owner, userId, userRole)) {
    throw new Error("You do not have permission to update this team.");
  }

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

  if (data.description !== undefined) {
    team.description = data.description.trim();
  }

  await team.save();

  return (await populateTeam(team._id)) as ITeam;
};

/**
 * DELETE TEAM
 */
export const deleteTeam = async (
  teamId: string,
  userId: string,
  userRole: ROLE,
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new Error("Invalid team ID.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  const team = await Team.findById(teamId);

  if (!team) {
    throw new Error("Team not found.");
  }

  if (!canManageTeam(team.owner, userId, userRole)) {
    throw new Error("You do not have permission to delete this team.");
  }

  await Team.findByIdAndDelete(teamId);
};
