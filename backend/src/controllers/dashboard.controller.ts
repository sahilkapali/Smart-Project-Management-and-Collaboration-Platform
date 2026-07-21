import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';

export const getSprintDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sprintId } = req.params;

    if (!sprintId) {
      return res.status(400).json({ success: false, message: 'Sprint ID is required' });
    }

    // FIX: Add "as string" right here
    const metrics = await dashboardService.calculateSprintMetrics(sprintId as string);

    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};