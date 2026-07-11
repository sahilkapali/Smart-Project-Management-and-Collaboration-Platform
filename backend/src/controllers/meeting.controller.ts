import { Request, Response, NextFunction} from 'express';
import { Meeting } from '../models/meeting.models';

/**
 * @desc create a new meeting 
 * @route POST/api/meetings
 * @access Private (Auth reqd)
 */

export const createMeeting = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try{
        // 1. extract incoming meeting config from the client request
        const {
            meetingTitle,
            description,
            project,
            member,
            startTime,
            endTime,
            meetingNotes
        } = req.body;



        // 2. identify manager securely using userID
        const managerID = (req as any).user?.id;

        // 3. return successfull JSON response
        const newMeeting = await Meeting.create({
            meetingTitle,
            description,
            project,
            manager: managerID,
            member,
            startTime,
            endTime,
            meetingNotes
        });


        // 4. Return 201 created status with new Document 
        res.status(201).json({
            success: true,
            message: 'Meeting scheduled successfully',
            data: newMeeting
        });
        
    } catch (error){
        // 4. unexpected database error to error handler
        next (error);
    }
};