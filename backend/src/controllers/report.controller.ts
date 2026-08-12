import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/custom';
import { getProjectReportService } from '../services/report.service';

/**
 * Generate report for a project
 * Route: GET /api/reports/project/:projectId
 */
export const getProjectReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      res.status(400).json({
        success: false,
        message: 'Project ID parameter is required.',
      });
      return;
    }

    const reportData = await getProjectReportService(projectId as string);

    res.status(200).json({
      success: true,
      message: 'Project report generated successfully.',
      data: reportData,
    });
  } catch (error: any) {
    if (error.message === 'Project not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};