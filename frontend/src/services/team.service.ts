import api from "./api";

import type {
  AddTeamMemberPayload,
  CreateTeamPayload,
  Team,
  TeamResponse,
  TeamsResponse,
  UpdateTeamPayload,
} from "../types/team.types";

/**
 * GET CURRENT USER TEAMS
 *
 * GET /api/teams
 *
 * Any authenticated user can access this.
 */
export const getMyTeams = async (): Promise<Team[]> => {
  const response = await api.get<TeamsResponse>("/teams");

  return response.data.data;
};

/**
 * GET SINGLE TEAM
 *
 * GET /api/teams/:teamId
 */
export const getTeamById = async (teamId: string): Promise<Team> => {
  const response = await api.get<TeamResponse<Team>>(`/teams/${teamId}`);

  return response.data.data;
};

/**
 * CREATE TEAM
 *
 * POST /api/teams
 *
 * Admin and Project Manager only.
 */
export const createTeam = async (data: CreateTeamPayload): Promise<Team> => {
  const response = await api.post<TeamResponse<Team>>("/teams", data);

  return response.data.data;
};

/**
 * ADD MEMBER TO TEAM
 *
 * POST /api/teams/:teamId/members
 */
export const addTeamMember = async (
  teamId: string,
  data: AddTeamMemberPayload,
): Promise<Team> => {
  const response = await api.post<TeamResponse<Team>>(
    `/teams/${teamId}/members`,
    data,
  );

  return response.data.data;
};

/**
 * REMOVE MEMBER FROM TEAM
 *
 * DELETE /api/teams/:teamId/members/:userId
 */
export const removeTeamMember = async (
  teamId: string,
  userId: string,
): Promise<Team> => {
  const response = await api.delete<TeamResponse<Team>>(
    `/teams/${teamId}/members/${userId}`,
  );

  return response.data.data;
};

/**
 * UPDATE TEAM
 *
 * PUT /api/teams/:teamId
 */
export const updateTeam = async (
  teamId: string,
  data: UpdateTeamPayload,
): Promise<Team> => {
  const response = await api.put<TeamResponse<Team>>(`/teams/${teamId}`, data);

  return response.data.data;
};

/**
 * DELETE TEAM
 *
 * DELETE /api/teams/:teamId
 */
export const deleteTeam = async (teamId: string): Promise<void> => {
  await api.delete(`/teams/${teamId}`);
};
