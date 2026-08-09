import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { getKanbanBoardService } from "../services/dashboard.service";

export const getSprintDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sprintId } = req.params;

    if (!sprintId) {
      return res.status(400).json({ success: false, message: 'Sprint ID is required' });
    }
    const metrics = await dashboardService.calculateSprintMetrics(sprintId as string);

    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};


export const getKanbanBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
      return;
    }

    const boardData = await getKanbanBoardService(projectId as string);

    res.status(200).json({
      success: true,
      message: "Kanban board data fetched successfully.",
      data: boardData,
    });
  } catch (error) {
    next(error);
  }
};