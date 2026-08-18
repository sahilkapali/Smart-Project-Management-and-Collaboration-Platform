import { Document, Types } from "mongoose";

// =====================================================
// POPULATED USER
// =====================================================

export interface IMeetingUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// =====================================================
// MEETING NOTE
// =====================================================

export interface IMeetingNote {
  _id?: Types.ObjectId;
  content: string;
  aiGeneratedSummary?: string;
  createdAt?: Date;
  updatedAt?: Date;
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

  createdBy: Types.ObjectId | IMeetingUser;

  participants: Array<Types.ObjectId | IMeetingUser>;

  notes: IMeetingNote[];

  actionItems: string[];

  createdAt: Date;
  updatedAt: Date;
}
