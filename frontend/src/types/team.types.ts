import type { UserRole } from "./user.types";

export interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole | string;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  owner: TeamMember;
  members: TeamMember[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeamPayload {
  name: string;
  description?: string;
}

export interface UpdateTeamPayload {
  name?: string;
  description?: string;
}

export interface AddTeamMemberPayload {
  userId: string;
}

export interface TeamResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface TeamsResponse {
  success: boolean;
  message: string;
  data: Team[];
}
