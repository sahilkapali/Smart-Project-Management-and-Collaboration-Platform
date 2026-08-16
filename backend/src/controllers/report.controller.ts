import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/custom";
import { getProjectReportService } from "../services/report.service";

/**
 * GENERATE PROJECT REPORT
 *
 * Route:
 * GET /api/reports/project/:projectId
 *
 * Authentication:
 * Protected route.
 */
export const getProjectReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { projectId } = req.params;

    // =====================================================
    // VALIDATE PROJECT ID PARAMETER
    // =====================================================

    if (!projectId) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Project ID parameter is required.",
        data: null,
      });
      return;
    }

    // =====================================================
    // GENERATE REPORT
    // =====================================================

    const reportData = await getProjectReportService(projectId);

    // =====================================================
    // SUCCESS RESPONSE
    // =====================================================

    res.status(200).json({
      success: true,
      message: "Project report generated successfully.",
      data: reportData,
    });
  } catch (error: unknown) {
    // =====================================================
    // HANDLE KNOWN SERVICE ERRORS
    // =====================================================

    if (error instanceof Error) {
      if (error.message === "Invalid project ID.") {
        res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: error.message,
          data: null,
        });
        return;
      }

      if (error.message === "Project not found.") {
        res.status(404).json({
          success: false,
          code: "NOT_FOUND",
          message: error.message,
          data: null,
        });
        return;
      }
    }

    // =====================================================
    // FORWARD UNKNOWN ERRORS
    // =====================================================

    next(error);
  }
};
