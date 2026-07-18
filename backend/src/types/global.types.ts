import { Document, Types } from "mongoose";
import { ROLE } from "./enum.types";

/**
 * JWT Payload
 */
export interface IJwtPayload {
  id: string;
  email: string;
  role: ROLE;
}

/**
 * Meeting Note Interface
 */
export interface IMeetingNote {
  content: string;
  aiGeneratedSummary?: string;
}

/**
 * Meeting Interface
 */
export interface IMeeting extends Document {
  meetingTitle: string;
  startTime: Date;
  endTime?: Date;
  attendees: Types.ObjectId[];
  project: Types.ObjectId;
  notes?: IMeetingNote[];
  createdAt: Date;
}
