/* ============================================================
   PROJECT TYPES
   ============================================================ */

export type ProjectStatus = "PLANNING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

/* ============================================================
   PROJECT
   ============================================================ */

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

/* ============================================================
   CREATE PROJECT
   ============================================================ */

export interface CreateProjectPayload {
  name: string;

  description?: string;

  status: ProjectStatus;

  startDate?: string;

  endDate?: string;

  teamId: string;

  progress?: number;
}

/* ============================================================
   UPDATE PROJECT
   ============================================================ */

export interface UpdateProjectPayload {
  name?: string;

  description?: string;

  status?: ProjectStatus;

  startDate?: string;

  endDate?: string;

  teamId?: string;

  progress?: number;
}
