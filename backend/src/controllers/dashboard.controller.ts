import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/custom";
import { getDashboardMetricsService } from "../services/dashboard.service";

/**
 * Get overall dashboard metrics
 *
 * Route:
 * GET /api/dashboard/metrics
 *
 * Authentication:
 * Required
 */
export const getDashboardMetrics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // ============================================================
    // GET AUTHENTICATED USER ID
    // ============================================================

    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized user.",
      });

      return;
    }

    // ============================================================
    // GET DASHBOARD METRICS
    // ============================================================

    const metrics = await getDashboardMetricsService(userId);

    // ============================================================
    // RESPONSE
    // ============================================================

    res.status(200).json({
      success: true,
      message: "Dashboard metrics fetched successfully.",
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};
