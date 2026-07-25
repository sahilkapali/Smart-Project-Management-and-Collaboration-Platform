import { Document, Types } from "mongoose";
import { ROLE } from "./enum.types";

export interface IJwtPayload {
  id: string;
  email: string;
  role: ROLE;
}

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

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}

export {};