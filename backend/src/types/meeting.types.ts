import { Document, Types } from "mongoose";

// =====================================================
// MEETING NOTE
// =====================================================

export interface IMeetingNote {
  content: string;
  aiGeneratedSummary?: string;
}

// =====================================================
// MEETING
// =====================================================

export interface IMeeting extends Document {
  title: string;
  description?: string;
  meetingLink?: string;

  startTime: Date;
  endTime?: Date;

  projectId: Types.ObjectId;

  createdBy: Types.ObjectId;

  participants: Types.ObjectId[];

  notes?: IMeetingNote[];

  actionItems?: string[];

  createdAt: Date;
  updatedAt: Date;
}
