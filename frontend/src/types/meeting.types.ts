export interface UserReference {
  _id: string;

  name?: string;
  firstName?: string;
  lastName?: string;

  email?: string;
  role?: string;
  avatar?: string;
}

// ============================================================
// PROJECT REFERENCE
// ============================================================

export interface ProjectReference {
  _id: string;
  name: string;

  description?: string;
  status?: string;
}

// ============================================================
// MEETING NOTE
// ============================================================

export interface MeetingNote {
  _id?: string;

  content: string;

  aiGeneratedSummary?: string;

  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// MEETING USER
// ============================================================

export interface MeetingUser {
  _id: string;

  name?: string;
  firstName?: string;
  lastName?: string;

  email?: string;
  role?: string;
  avatar?: string;
}

// ============================================================
// MEETING
// ============================================================

export interface Meeting {
  _id: string;

  title: string;

  description?: string;

  meetingLink?: string;

  startTime: string | Date;

  endTime?: string | Date;

  projectId: string | ProjectReference;

  createdBy: string | MeetingUser;

  participants: Array<string | MeetingUser>;

  notes?: MeetingNote[];

  actionItems?: string[];

  createdAt: string | Date;

  updatedAt: string | Date;
}

// ============================================================
// CREATE MEETING
// ============================================================

export interface CreateMeetingData {
  title: string;

  description?: string;

  meetingLink?: string;

  startTime: string;

  endTime?: string;

  projectId: string;

  participants: string[];
}

// ============================================================
// UPDATE MEETING
// ============================================================

export interface UpdateMeetingData {
  title?: string;

  description?: string;

  meetingLink?: string;

  startTime?: string;

  endTime?: string;

  projectId?: string;

  participants?: string[];
}

// ============================================================
// API RESPONSE
// ============================================================

export interface MeetingResponse {
  success: boolean;

  message?: string;

  data: Meeting;
}

// ============================================================
// MEETING LIST RESPONSE
// ============================================================

export interface MeetingListResponse {
  success: boolean;

  message?: string;

  data: Meeting[];
}

// ============================================================
// AI RESPONSE
// ============================================================

export interface MeetingAIResponse {
  success?: boolean;

  message?: string;

  data?: unknown;

  result?: unknown;

  output?: unknown;
}

// Prevent accidental unused-import issues while keeping
// compatibility with projects that already expose User.
export type MeetingUserReference = UserReference;
