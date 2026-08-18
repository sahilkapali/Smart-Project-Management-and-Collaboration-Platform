/* ============================================================
   MEETING USER
============================================================ */

export interface MeetingUser {
  id: string;
  _id?: string;

  name?: string;
  firstName?: string;
  lastName?: string;

  email: string;

  role?: string;

  avatar?: string;
}

/* ============================================================
   USER REFERENCE
============================================================ */

export interface UserReference {
  id: string;
  _id?: string;

  name?: string;
  firstName?: string;
  lastName?: string;

  email: string;

  role?: string;

  avatar?: string;
}

/* ============================================================
   MEETING PROJECT
============================================================ */

export interface MeetingProject {
  id: string;
  _id?: string;

  name?: string;
}

/* ============================================================
   PROJECT REFERENCE
============================================================ */

export interface ProjectReference {
  id: string;
  _id?: string;

  name?: string;
}

/* ============================================================
   MEETING NOTE
============================================================ */

export interface MeetingNote {
  id?: string;
  _id?: string;

  content: string;

  aiGeneratedSummary?: string;

  createdAt?: string;
  updatedAt?: string;
}

/* ============================================================
   MEETING
============================================================ */

export interface Meeting {
  id: string;
  _id?: string;

  title: string;

  description?: string;

  meetingLink?: string;

  startTime: string;

  endTime?: string | null;

  projectId: string;

  project?: MeetingProject;

  createdBy: MeetingUser | null;

  participants: MeetingUser[];

  notes: MeetingNote[];

  actionItems: string[];

  createdAt?: string;

  updatedAt?: string;
}

/* ============================================================
   CREATE MEETING
============================================================ */

export interface CreateMeetingPayload {
  title: string;

  description?: string;

  meetingLink?: string;

  projectId: string;

  participants?: string[];

  startTime: string;

  endTime?: string;

  notes?: Array<{
    content: string;
  }>;
}

/* ============================================================
   BACKWARD COMPATIBILITY
============================================================ */

export type CreateMeetingData = CreateMeetingPayload;

/* ============================================================
   UPDATE MEETING
============================================================ */

export interface UpdateMeetingPayload {
  title?: string;

  description?: string;

  meetingLink?: string;

  projectId?: string;

  participants?: string[];

  startTime?: string;

  endTime?: string;

  notes?: Array<{
    _id?: string;
    id?: string;

    content: string;

    aiGeneratedSummary?: string;
  }>;
}

/* ============================================================
   ADD MEETING NOTE
============================================================ */

export interface AddMeetingNotePayload {
  content: string;
}

/* ============================================================
   UPDATE MEETING NOTE
============================================================ */

export interface UpdateMeetingNotePayload {
  noteId: string;

  content: string;
}

/* ============================================================
   PATCH MEETING NOTE
============================================================ */

export interface PatchMeetingNotePayload {
  noteId: string;

  content?: string;
}
