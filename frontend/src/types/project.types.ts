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
   * Populated team object returned by the backend.
   */
  team: ProjectTeam | string;

  /**
   * Team ID kept for compatibility
   * with existing frontend code.
   */
  teamId: string;

  createdBy: string;

  members: string[];

  status: ProjectStatus;

  startDate?: string | null;

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

  dueDate?: string;
}
