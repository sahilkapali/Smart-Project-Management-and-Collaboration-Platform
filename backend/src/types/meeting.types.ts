import { Document, Types } from "mongoose";

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

  createdBy: Types.ObjectId;

  notes?: IMeetingNote[];

  actionItems?: string[];

  createdAt: Date;
  updatedAt: Date;
}