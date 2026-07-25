import mongoose from 'mongoose';
import Meeting from '../models/meeting.models';


export const createMeeting = async (meetingData: Record<string, any>) => {
  const meeting = new Meeting(meetingData);
  return await meeting.save();
};


export const getMeetingsByProject = async (projectId: string) => {
  return await Meeting.find({ projectId })
    .populate('createdBy', 'name email')
    .populate('participants', 'name email')
    .sort({ startTime: 1 }); 
};


export const getMeetingById = async (id: string) => {
  return await Meeting.findById(id)
    .populate('createdBy', 'name email')
    .populate('participants', 'name email');
};


export const updateMeeting = async (id: string, updateData: Record<string, any>) => {
  return await Meeting.findByIdAndUpdate(id, updateData, { new: true })
    .populate('createdBy', 'name email')
    .populate('participants', 'name email');
};


export const deleteMeeting = async (id: string) => {
  return await Meeting.findByIdAndDelete(id);
};