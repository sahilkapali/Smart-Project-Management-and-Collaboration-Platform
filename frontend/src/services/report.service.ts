import api from "./api";

import type {
  ProjectReportData,
  ProjectReportResponse,
} from "../types/report.types";

/**
 * GET PROJECT REPORT
 *
 * GET /api/reports/project/:projectId
 */
export const getProjectReport = async (
  projectId: string,
): Promise<ProjectReportData> => {
  const response = await api.get<ProjectReportResponse>(
    `/reports/project/${projectId}`,
  );

  return response.data.data;
};
