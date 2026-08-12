import {
  Request,
  Response,
  NextFunction
} from 'express';

import * as aiService from '../services/ai.service';


// =====================================================
// GENERAL PROJECT INSIGHT
// POST /api/ai/insight
// =====================================================

export const getProjectInsight = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const projectId = String(req.body.projectId);

    if (!projectId || projectId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'projectId is required'
      });
    }

    const result =
      await aiService.createProjectInsight(
        projectId,
        userId
      );

    return res.status(200).json({
      success: true,
      message: 'Project insight generated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// TASK PRIORITIZATION
// POST /api/tasks/:id/ai-prioritize
// =====================================================

export const prioritizeTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const taskId = String(req.params.id);

    if (!taskId || taskId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
    }

    const result =
      await aiService.prioritizeTaskByAI(
        taskId,
        userId
      );

    return res.status(200).json({
      success: true,
      message: 'Task priority recommendation generated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// MEETING SUMMARY
// PATCH /api/meetings/:id/ai-summary
// =====================================================

export const generateSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const meetingId = String(req.params.id);

    if (!meetingId || meetingId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Meeting ID is required'
      });
    }

    const result =
      await aiService.summarizeMeeting(
        meetingId,
        userId
      );

    return res.status(200).json({
      success: true,
      message: 'Meeting summary generated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// MEETING ACTION ITEMS
// PATCH /api/meetings/:id/action-items
// =====================================================

export const generateActionItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const meetingId = String(req.params.id);

    if (!meetingId || meetingId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Meeting ID is required'
      });
    }

    const result =
      await aiService.extractMeetingActionItems(
        meetingId,
        userId
      );

    return res.status(200).json({
      success: true,
      message: 'Meeting action items generated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// GET PROJECT AI OUTPUTS
// GET /api/ai/project/:projectId
// =====================================================

export const getProjectAIOutputs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const projectId =
      String(req.params.projectId);

    if (!projectId || projectId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const outputs =
      await aiService.getProjectAIOutputs(
        projectId,
        userId
      );

    return res.status(200).json({
      success: true,
      data: outputs
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// GET TASK AI OUTPUTS
// GET /api/ai/task/:taskId
// =====================================================

export const getTaskAIOutputs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const taskId =
      String(req.params.taskId);

    if (!taskId || taskId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
    }

    const outputs =
      await aiService.getTaskAIOutputs(
        taskId,
        userId
      );

    return res.status(200).json({
      success: true,
      data: outputs
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// GET MEETING AI OUTPUTS
// GET /api/ai/meeting/:meetingId
// =====================================================

export const getMeetingAIOutputs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const meetingId =
      String(req.params.meetingId);

    if (!meetingId || meetingId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Meeting ID is required'
      });
    }

    const outputs =
      await aiService.getMeetingAIOutputs(
        meetingId,
        userId
      );

    return res.status(200).json({
      success: true,
      data: outputs
    });
  } catch (error) {
    next(error);
  }
};