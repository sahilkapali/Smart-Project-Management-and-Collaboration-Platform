import api from "./api";

import type {
  ProjectReport,
  ProjectReportResponse,
} from "../types/report.types";

// =====================================================
// GET PROJECT REPORT
// =====================================================

export const getProjectReport = async (
  projectId: string,
): Promise<ProjectReport> => {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  const response = await api.get<ProjectReportResponse>(
    `/reports/project/${projectId}`,
  );

  if (!response.data.success) {
    throw new Error(
      response.data.message || "Unable to generate project report.",
    );
  }

  if (!response.data.data) {
    throw new Error("Project report data was not returned.");
  }

  return response.data.data;
};
