export type BackendProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "COMPLETED"
  | "ARCHIVED";

export type ProjectStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export interface Project {
  id: string;

  _id?: string;

  name: string;

  description?: string;

  status: BackendProjectStatus | string;

  teamId?: string;

  team?: any;

  startDate?: string;

  dueDate?: string;

  endDate?: string;

  createdAt?: string;

  updatedAt?: string;

  members?: any[];

  createdBy?: any;
}

export interface CreateProjectPayload {
  name: string;

  description?: string;

  status?: BackendProjectStatus;

  teamId: string;

  startDate?: string;

  dueDate?: string;
}

export interface UpdateProjectPayload {
  name?: string;

  description?: string;

  status?: BackendProjectStatus;

  teamId?: string;

  startDate?: string;

  dueDate?: string;
}