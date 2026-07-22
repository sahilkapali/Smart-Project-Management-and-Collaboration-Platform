import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as meetingService from '../services/meeting.service';


const objectIdRule = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID format');

const createMeetingSchema = z.object({
  title: z.string()
    .min(3, 'Meeting title must be at least 3 characters long')
    .max(100, 'Meeting title cannot exceed 100 characters'),
  description: z.string().optional(),
  meetingLink: z.string().url('Invalid meeting link URL').optional().or(z.literal('')),
  projectId: objectIdRule,
  participants: z.array(objectIdRule).default([]),
  startTime: z.coerce.date({ message: 'Start time must be a valid date' }),
  endTime: z.coerce.date({ message: 'End time must be a valid date' }),
}).refine((data) => data.endTime > data.startTime, {
  message: 'Meeting end time must be later than the start time',
  path: ['endTime'],
});

const updateMeetingSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
  projectId: objectIdRule.optional(),
  participants: z.array(objectIdRule).optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: 'Meeting end time must be later than the start time',
  path: ['endTime'],
});




export const createMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const validatedBody = createMeetingSchema.parse(req.body);

    const userId = (req as any).user.id;
    const meetingData = {
      ...validatedBody,
      createdBy: userId,
    };

    const meeting = await meetingService.createMeeting(meetingData);

    return res.status(201).json({
      success: true,
      message: 'Meeting scheduled successfully',
      data: meeting,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((err) => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessage,
        errors: error.issues,
      });
    }
    next(error);
  }
};


export const getProjectMeetings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;

    const meetings = await meetingService.getMeetingsByProject(projectId as string);

    return res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    next(error);
  }
};


export const getMeetingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const meeting = await meetingService.getMeetingById(id as string);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    return res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    next(error);
  }
};


export const updateMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

   
    const validatedBody = updateMeetingSchema.parse(req.body);

    const updatedMeeting = await meetingService.updateMeeting(id as string, validatedBody);

    if (!updatedMeeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Meeting updated successfully',
      data: updatedMeeting,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((err) => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessage,
        errors: error.issues,
      });
    }
    next(error);
  }
};


export const deleteMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const deleted = await meetingService.deleteMeeting(id as string);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};