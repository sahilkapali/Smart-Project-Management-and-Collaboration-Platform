export type ProjectStatus = "PLANNING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface Project {
  id: string;

  name: string;

  description?: string | null;

  status: ProjectStatus;

  progress?: number;

  startDate?: string | null;

  endDate?: string | null;

  teamId?: string | null;

  createdAt?: string;

  updatedAt?: string;

  members?: any[];

  createdBy?: any;
}

export interface CreateProjectPayload {
  name: string;

  description?: string;

  status: ProjectStatus;

  startDate?: string;

  endDate?: string;

  teamId: string;

  progress?: number;
}

export interface UpdateProjectPayload {
  name?: string;

  description?: string;

  status?: ProjectStatus;

  startDate?: string;

  endDate?: string;

  teamId?: string;

  progress?: number;
}
