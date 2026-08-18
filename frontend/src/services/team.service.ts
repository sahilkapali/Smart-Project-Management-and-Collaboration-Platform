import api from "./api";

import type {
  AddTeamMemberPayload,
  CreateTeamPayload,
  Team,
  TeamResponse,
  TeamsResponse,
  UpdateTeamPayload,
} from "../types/team.types";

export const getMyTeams = async (): Promise<Team[]> => {
  const response = await api.get<TeamsResponse>("/teams");

  return response.data.data;
};

export const getTeamById = async (teamId: string): Promise<Team> => {
  const response = await api.get<TeamResponse<Team>>(`/teams/${teamId}`);

  return response.data.data;
};

export const createTeam = async (data: CreateTeamPayload): Promise<Team> => {
  const response = await api.post<TeamResponse<Team>>("/teams", data);

  return response.data.data;
};

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

export const removeTeamMember = async (
  teamId: string,
  userId: string,
): Promise<Team> => {
  const response = await api.delete<TeamResponse<Team>>(
    `/teams/${teamId}/members/${userId}`,
  );

  return response.data.data;
};

export const updateTeam = async (
  teamId: string,
  data: UpdateTeamPayload,
): Promise<Team> => {
  const response = await api.put<TeamResponse<Team>>(`/teams/${teamId}`, data);

  return response.data.data;
};

export const deleteTeam = async (teamId: string): Promise<void> => {
  await api.delete(`/teams/${teamId}`);
};
