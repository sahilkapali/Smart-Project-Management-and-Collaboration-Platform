import { Request, Response } from 'express';
import Meeting from '../models/meeting.models'; 

// 1. CREATE A MEETING
export const createMeeting = async (req: Request, res: Response) => {
  try {
    const { 
      meetingTitle, 
      startTime, 
      endTime,  
      attendees, 
      project, 
      content // Raw transcript from the frontend
    } = req.body;

    const newMeeting = await Meeting.create({
      meetingTitle,
      startTime,
      endTime,
      attendees,
      project,
      notes: content ? [{ content }] : [] 
    });

    res.status(201).json({ success: true, data: newMeeting });
  } catch (error: any) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ success: false, message: "Failed to create meeting", error: error.message });
  }
};

// 2. GET ALL MEETINGS FOR A PROJECT
export const getProjectMeetings = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    
    const meetings = await Meeting.find({ project: projectId })
      .populate('attendees', 'userName email') 
      .sort({ startTime: -1 }); 

    res.status(200).json({ success: true, count: meetings.length, data: meetings });
  } catch (error: any) {
    console.error("Error fetching project meetings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch meetings" });
  }
};

// 3. GET A SINGLE MEETING
export const getMeetingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const meeting = await Meeting.findById(id).populate('attendees', 'userName email');

    if (!meeting) {
      res.status(404).json({ success: false, message: "Meeting not found" });
      return;
    }

    res.status(200).json({ success: true, data: meeting });
  } catch (error: any) {
    console.error("Error fetching meeting:", error);
    res.status(500).json({ success: false, message: "Failed to fetch meeting" });
  }
};

// 4. UPDATE A MEETING
export const updateMeeting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true } 
    );

    if (!updatedMeeting) {
      res.status(404).json({ success: false, message: "Meeting not found" });
      return;
    }

    res.status(200).json({ success: true, data: updatedMeeting });
  } catch (error: any) {
    console.error("Error updating meeting:", error);
    res.status(500).json({ success: false, message: "Failed to update meeting" });
  }
};

// 5. DELETE A MEETING
export const deleteMeeting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedMeeting = await Meeting.findByIdAndDelete(id);

    if (!deletedMeeting) {
      res.status(404).json({ success: false, message: "Meeting not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Meeting successfully deleted" });
  } catch (error: any) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({ success: false, message: "Failed to delete meeting" });
  }
};