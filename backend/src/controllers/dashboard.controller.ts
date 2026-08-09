import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/custom';
import { getDashboardMetricsService } from '../services/dashboard.service';

/**
 * Get overall dashboard metrics
 * Route: GET /api/dashboard/metrics
 */
export const getDashboardMetrics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized user.' });
      return;
    }

    const metrics = await getDashboardMetricsService(userId.toString());

    res.status(200).json({
      success: true,
      message: 'Dashboard metrics fetched successfully.',
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};