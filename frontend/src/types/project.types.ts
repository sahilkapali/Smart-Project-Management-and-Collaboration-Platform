export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  teamId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  teamId: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  teamId?: string;
}