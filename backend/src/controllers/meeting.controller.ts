import { Request, Response, NextFunction} from 'express';
import { Meeting } from '../models/meeting.models';
import { request } from 'node:http';

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


/**
 * @desc get all meetings associated with a specific project
 * @route get /api/projects/:projectID/meetings
 * @access Private (requires auth)
 */

export const getProjectMeetings = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try{
        // 1. Extract the projectID form the request URL parameters
        const {projectID} = req.params;

        // 2. QUery MongoDB for meetings belonging to this project.
        const meetings = await Meeting.find({project: projectID})
            .populate('manager', 'name email')
            .sort({ createdAt: -1});

        //3. Respond with a 200 OK success code and the array of meetings
        res.status(200).json({
            success:true,
            count: meetings.length,
            message: 'Meetings retrived successfully',
            data: meetings
        });

    } catch (error) {
        // Forward any unexpoected database or server error to global error middleware
        next(error);
    }
}


/**
 * @desc    get details for a single specific meeting 
 * @route   get /api.meeting/:id
 * @access  Private (reqd auth)
 */

export const getMeetingByID = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        //1. Extract the meeting document ID from URL parameters
        const { id } = req.params;

        //2. Query MongoDB for this specific record and populate manager data
        const meeting = await Meeting.findById(id).populate('manager','name email');

        //3. If no matching found, return a 404 resource error immediately
        if (!meeting){
            res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        //4. Return a 200 OK success witht he comprehensive dataset
        res.status(200).json({
            success: true,
            message: 'Meeting details retrived successfully',
            data: meeting
        });
    } catch (error){
        next(error);
    }
};



/** 
 * @desc    Update an existing meeting
 * @route   Patch /api/meetings/:id
 * @access  Private (reqd auth)
 */



export const updateMeeting = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const {id} = req.params;

        const updateMeeting = await Meeting.findByIdAndUpdate(id, req.body,{
            new: true,
            runValidators: true
        }). populate('manager', 'name email');

        if (!updateMeeting) {
            res.status(404).json({
                success: false,
                message: 'meeting not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'meeting updated successfully',
            data: updateMeeting
        });
    } catch (error) {
        next(error);
    }
};





/**
 * @desc    Delete a specific meeting log
 * @route   Delete /api/meetings/:id
 * @access  Private (reqd auth)
 */


export const deleteMeeting = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try{
        const {id} = req.params;
        const deletedMeeting = await Meeting.findByIdAndDelete(id);

        if (!deleteMeeting) {
            res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Meeting deleted successfully',
            data: deletedMeeting
        });

    } catch (error) {
        next(error);
    }
};