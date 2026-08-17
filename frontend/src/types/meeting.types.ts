export interface UserReference {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface ProjectReference {
  _id: string;
  name: string;
}

export interface MeetingNote {
  _id?: string;
  content: string;
  aiGeneratedSummary?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  meetingLink?: string;

  startTime: string;
  endTime?: string;

  projectId: string;

  createdBy?: UserReference | string;

  participants: Array<
    UserReference | string
  >;

  notes?: MeetingNote[];

  actionItems?: string[];

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMeetingData {
  title: string;
  description?: string;
  meetingLink?: string;
  projectId: string;
  participants: string[];
  startTime: string;
  endTime: string;
}

export interface UpdateMeetingData {
  title?: string;
  description?: string;
  meetingLink?: string;
  projectId?: string;
  participants?: string[];
  startTime?: string;
  endTime?: string;
}

export interface MeetingResponse {
  success: boolean;
  message?: string;
  data: Meeting;
}

export interface MeetingListResponse {
  success: boolean;
  message?: string;
  data: Meeting[];
}