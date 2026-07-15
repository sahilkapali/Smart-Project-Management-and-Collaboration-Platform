import { Document, Types } from 'mongoose';


export interface IMeetingNote {
  content: string;             
  aiGeneratedSummary?: string; 
}



export interface IMeeting extends Document {
  meetingTitle: string;         
  startTime: Date;              
  endTime?: Date;                          
  attendees: Types.ObjectId[];  
  project: Types.ObjectId;      
  notes?: IMeetingNote[];       
  createdAt: Date;
}