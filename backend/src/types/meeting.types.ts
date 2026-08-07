import { Document, Types } from 'mongoose';

export interface IMeetingNote {
  content: string;             
  aiGeneratedSummary?: string; 
}

export interface IMeeting extends Document {
  title: string;                 
  description?: string;          
  meetingLink?: string;          
  startTime: Date;              
  endTime?: Date;                          
  participants: Types.ObjectId[];
  projectId: Types.ObjectId;     
  notes?: IMeetingNote[];       
  createdAt: Date;
}