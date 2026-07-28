import { Request, Response, NextFunction } from 'express';
import * as meetingService from '../services/meeting.service';


const isValidObjectId = (id: any): boolean => {
  if (typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const isValidUrl = (urlString: any): boolean => {
  if (typeof urlString !== 'string') return false;
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
};



/**
 * Create a new meeting
 * Route: POST /api/meetings
 */
export const createMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, meetingLink, projectId, participants, startTime, endTime } = req.body;
    const errors: string[] = [];

   
    if (!title || typeof title !== 'string' || title.length < 3 || title.length > 100) {
      errors.push('Meeting title must be a string between 3 and 100 characters');
    }

  
    if (!projectId || !isValidObjectId(projectId)) {
      errors.push('Invalid or missing projectId');
    }

    
    if (meetingLink && typeof meetingLink === 'string' && meetingLink.trim() !== '') {
      if (!isValidUrl(meetingLink)) {
        errors.push('Invalid meeting link URL');
      }
    }


    let parsedParticipants = participants || [];
    if (!Array.isArray(parsedParticipants)) {
      errors.push('Participants must be an array');
    } else {
      const allValid = parsedParticipants.every(id => isValidObjectId(id));
      if (!allValid) errors.push('One or more participant IDs are invalid MongoDB IDs');
    }


    const start = new Date(startTime);
    const end = new Date(endTime);

    if (!startTime || isNaN(start.getTime())) {
      errors.push('Start time must be a valid date');
    }
    if (!endTime || isNaN(end.getTime())) {
      errors.push('End time must be a valid date');
    }
    

    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
      errors.push('Meeting end time must be later than the start time');
    }

   
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    
    const userId = req.user?.id  
    const meetingData = {
      title,
      description,
      meetingLink,
      projectId,
      participants: parsedParticipants,
      startTime: start,
      endTime: end,
      createdBy: userId,
    };

    const meeting = await meetingService.createMeeting(meetingData);

    return res.status(201).json({
      success: true,
      message: 'Meeting scheduled successfully',
      data: meeting,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing meeting
 * Route: PUT /api/meetings/:id
 */
export const updateMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, meetingLink, projectId, participants, startTime, endTime } = req.body;
    const errors: string[] = [];

    
    if (title !== undefined) {
      if (typeof title !== 'string' || title.length < 3 || title.length > 100) {
        errors.push('Meeting title must be a string between 3 and 100 characters');
      }
    }

    if (projectId !== undefined && !isValidObjectId(projectId)) {
      errors.push('Invalid projectId');
    }

    if (meetingLink !== undefined && typeof meetingLink === 'string' && meetingLink.trim() !== '') {
      if (!isValidUrl(meetingLink)) {
        errors.push('Invalid meeting link URL');
      }
    }

    if (participants !== undefined) {
      if (!Array.isArray(participants)) {
        errors.push('Participants must be an array');
      } else {
        const allValid = participants.every(pid => isValidObjectId(pid));
        if (!allValid) errors.push('One or more participant IDs are invalid MongoDB IDs');
      }
    }

    let start: Date | undefined;
    let end: Date | undefined;

    if (startTime !== undefined) {
      start = new Date(startTime);
      if (isNaN(start.getTime())) errors.push('Start time must be a valid date');
    }

    if (endTime !== undefined) {
      end = new Date(endTime);
      if (isNaN(end.getTime())) errors.push('End time must be a valid date');
    }

    if (start && end && start >= end) {
      errors.push('Meeting end time must be later than the start time');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    
    const updatedMeeting = await meetingService.updateMeeting(id as string, req.body);

    if (!updatedMeeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Meeting updated successfully',
      data: updatedMeeting,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all meetings for a specific project
 * Route: GET /api/meetings/project/:projectId
 */
export const getProjectMeetings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const meetings = await meetingService.getMeetingsByProject(projectId as string);
    return res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single meeting by ID
 * Route: GET /api/meetings/:id
 */
export const getMeetingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const meeting = await meetingService.getMeetingById(id as string);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    return res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a meeting
 * Route: DELETE /api/meetings/:id
 */
export const deleteMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await meetingService.deleteMeeting(id as string);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    return res.status(200).json({ success: true, message: 'Meeting deleted successfully' });
  } catch (error) {
    next(error);
  }
};