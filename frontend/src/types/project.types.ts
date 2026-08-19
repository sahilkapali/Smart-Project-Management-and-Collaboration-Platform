/* ============================================================
   PROJECT STATUS
   ============================================================ */

export type ProjectStatus = "PLANNING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

/* ============================================================
   PROJECT TEAM
   ============================================================ */

export interface ProjectTeam {
  _id: string;
  name: string;

  owner?: string;

  members?: string[];
}

/* ============================================================
   PROJECT
   ============================================================ */

export interface Project {
  id: string;

  name: string;

  description?: string | null;

  /**
   * Populated team object returned by backend.
   */
  team: ProjectTeam | string;

  /**
   * Team ID compatibility field.
   */
  teamId: string;

  createdBy: string;

  members: string[];

  status: ProjectStatus;

  /**
   * Project completion percentage.
   */
  progress?: number;

  startDate?: string | null;

  /**
   * Backend/UI uses endDate.
   */
  endDate?: string | null;

  /**
   * Keep dueDate for backward compatibility.
   */
  dueDate?: string | null;

  createdAt?: string;

  updatedAt?: string;
}

/* ============================================================
   CREATE PROJECT
   ============================================================ */

export interface CreateProjectPayload {
  name: string;

  description?: string;

  teamId: string;

  status?: ProjectStatus;

  startDate?: string;

  endDate?: string;

  dueDate?: string;
}

/* ============================================================
   UPDATE PROJECT
   ============================================================ */

export interface UpdateProjectPayload {
  name?: string;

  description?: string;

  teamId?: string;

  status?: ProjectStatus;

  startDate?: string;

  endDate?: string;

  dueDate?: string;
}
