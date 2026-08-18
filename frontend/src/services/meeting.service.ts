import api from "./api";

import type {
  Meeting,
  MeetingNote,
  MeetingUser,
  MeetingProject,
  CreateMeetingPayload,
  UpdateMeetingPayload,
} from "../types/meeting.types";

/* ============================================================
   BACKEND TYPES
============================================================ */

interface BackendUser {
  _id?: string;
  id?: string;

  name?: string;

  firstName?: string;
  lastName?: string;

  email?: string;

  role?: string;

  avatar?: string;
}

interface BackendProject {
  _id?: string;
  id?: string;

  name?: string;
}

interface BackendMeetingNote {
  _id?: string;
  id?: string;

  content?: string;

  aiGeneratedSummary?: string;

  createdAt?: string;

  updatedAt?: string;
}

interface BackendMeeting {
  _id?: string;
  id?: string;

  title?: string;

  description?: string;

  meetingLink?: string;

  startTime?: string;

  endTime?: string | null;

  projectId?: string | BackendProject;

  project?: BackendProject;

  createdBy?: BackendUser | string | null;

  participants?: Array<BackendUser | string>;

  notes?: BackendMeetingNote[];

  actionItems?: string[];

  createdAt?: string;

  updatedAt?: string;
}

/* ============================================================
   RESPONSE TYPES
============================================================ */

interface ApiResponse<T> {
  success?: boolean;

  message?: string;

  data?: T;

  meeting?: T;

  meetings?: T;
}

/* ============================================================
   ID HELPER
============================================================ */

const getId = (
  value:
    | string
    | {
        id?: string;
        _id?: string;
      }
    | null
    | undefined,
): string => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.id ?? value._id ?? "";
};

/* ============================================================
   USER NORMALIZATION
============================================================ */

const normalizeUser = (
  user: BackendUser | string | null | undefined,
): MeetingUser | null => {
  if (!user) {
    return null;
  }

  if (typeof user === "string") {
    return {
      id: user,
      _id: user,
      name: "",
      firstName: "",
      lastName: "",
      email: "",
    };
  }

  const id = getId(user);

  return {
    id,

    _id: id || undefined,

    name: user.name ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),

    firstName: user.firstName ?? "",

    lastName: user.lastName ?? "",

    email: user.email ?? "",

    role: user.role,

    avatar: user.avatar,
  };
};

/* ============================================================
   PROJECT NORMALIZATION
============================================================ */

const normalizeProject = (
  project: string | BackendProject | null | undefined,
): MeetingProject | undefined => {
  if (!project) {
    return undefined;
  }

  if (typeof project === "string") {
    return {
      id: project,
      _id: project,
    };
  }

  const id = getId(project);

  return {
    id,

    _id: id || undefined,

    name: project.name,
  };
};

/* ============================================================
   NOTE NORMALIZATION
============================================================ */

const normalizeNote = (note: BackendMeetingNote): MeetingNote => {
  const id = note.id ?? note._id;

  return {
    id,

    _id: id,

    content: note.content ?? "",

    aiGeneratedSummary: note.aiGeneratedSummary ?? "",

    createdAt: note.createdAt,

    updatedAt: note.updatedAt,
  };
};

/* ============================================================
   MEETING NORMALIZATION
============================================================ */

const normalizeMeeting = (meeting: BackendMeeting): Meeting => {
  const meetingId = meeting.id ?? meeting._id ?? "";

  const rawProject = meeting.project ?? meeting.projectId;

  const project =
    typeof rawProject === "object" ? normalizeProject(rawProject) : undefined;

  const projectId =
    typeof meeting.projectId === "string"
      ? meeting.projectId
      : getId(meeting.projectId) || getId(meeting.project);

  return {
    id: meetingId,

    _id: meetingId || undefined,

    title: meeting.title ?? "",

    description: meeting.description ?? "",

    meetingLink: meeting.meetingLink ?? "",

    startTime: meeting.startTime ?? "",

    endTime: meeting.endTime ?? null,

    projectId,

    project,

    createdBy: normalizeUser(meeting.createdBy),

    participants: Array.isArray(meeting.participants)
      ? meeting.participants
          .map((participant) => normalizeUser(participant))
          .filter(
            (participant): participant is MeetingUser => participant !== null,
          )
      : [],

    notes: Array.isArray(meeting.notes) ? meeting.notes.map(normalizeNote) : [],

    actionItems: Array.isArray(meeting.actionItems) ? meeting.actionItems : [],

    createdAt: meeting.createdAt,

    updatedAt: meeting.updatedAt,
  };
};

/* ============================================================
   EXTRACT SINGLE MEETING
============================================================ */

const extractMeeting = (responseData: unknown): BackendMeeting => {
  const data = responseData as ApiResponse<BackendMeeting>;

  return (data?.data ?? data?.meeting ?? responseData) as BackendMeeting;
};

/* ============================================================
   EXTRACT MEETINGS
============================================================ */

const extractMeetings = (responseData: unknown): BackendMeeting[] => {
  if (Array.isArray(responseData)) {
    return responseData as BackendMeeting[];
  }

  const data = responseData as ApiResponse<BackendMeeting[]>;

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.meetings)) {
    return data.meetings;
  }

  return [];
};

/* ============================================================
   MEETING SERVICE
============================================================ */

const meetingService = {
  /* ==========================================================
     CREATE
  ========================================================== */

  async createMeeting(data: CreateMeetingPayload): Promise<Meeting> {
    const response = await api.post("/meetings", data);

    const meeting = extractMeeting(response.data);

    return normalizeMeeting(meeting);
  },

  /* ==========================================================
     GET PROJECT MEETINGS
  ========================================================== */

  async getProjectMeetings(projectId: string): Promise<Meeting[]> {
    const response = await api.get(`/meetings/project/${projectId}`);

    return extractMeetings(response.data).map(normalizeMeeting);
  },

  /* ==========================================================
     ALIAS
  ========================================================== */

  async getMeetingsByProject(projectId: string): Promise<Meeting[]> {
    return this.getProjectMeetings(projectId);
  },

  /* ==========================================================
     GET ONE
  ========================================================== */

  async getMeetingById(meetingId: string): Promise<Meeting> {
    const response = await api.get(`/meetings/${meetingId}`);

    const meeting = extractMeeting(response.data);

    return normalizeMeeting(meeting);
  },

  /* ==========================================================
     UPDATE
  ========================================================== */

  async updateMeeting(
    meetingId: string,
    data: UpdateMeetingPayload,
  ): Promise<Meeting> {
    const response = await api.put(`/meetings/${meetingId}`, data);

    const meeting = extractMeeting(response.data);

    return normalizeMeeting(meeting);
  },

  /* ==========================================================
     DELETE
  ========================================================== */

  async deleteMeeting(meetingId: string): Promise<void> {
    await api.delete(`/meetings/${meetingId}`);
  },

  /* ==========================================================
     ADD NOTE
  ========================================================== */

  async addMeetingNote(meetingId: string, content: string): Promise<Meeting> {
    const response = await api.post(`/meetings/${meetingId}/notes`, {
      content,
    });

    const meeting = extractMeeting(response.data);

    return normalizeMeeting(meeting);
  },

  /* ==========================================================
     BACKWARD COMPATIBILITY
  ========================================================== */

  async addMeetingNotes(meetingId: string, content: string): Promise<Meeting> {
    return this.addMeetingNote(meetingId, content);
  },

  /* ==========================================================
     UPDATE NOTE
  ========================================================== */

  async updateMeetingNote(
    meetingId: string,
    noteId: string,
    content: string,
  ): Promise<Meeting> {
    const response = await api.put(`/meetings/${meetingId}/notes`, {
      noteId,
      content,
    });

    const meeting = extractMeeting(response.data);

    return normalizeMeeting(meeting);
  },

  /* ==========================================================
     PATCH NOTE
  ========================================================== */

  async patchMeetingNote(
    meetingId: string,
    noteId: string,
    content?: string,
  ): Promise<Meeting> {
    const body: {
      noteId: string;
      content?: string;
    } = {
      noteId,
    };

    if (content !== undefined) {
      body.content = content;
    }

    const response = await api.patch(`/meetings/${meetingId}/notes`, body);

    const meeting = extractMeeting(response.data);

    return normalizeMeeting(meeting);
  },

  /* ==========================================================
     AI SUMMARY
  ========================================================== */

  async summarizeMeetingNote(
    meetingId: string,
    noteId?: string,
  ): Promise<Meeting> {
    const response = await api.patch(
      `/meetings/${meetingId}/ai-summary`,
      noteId ? { noteId } : {},
    );

    const meeting = extractMeeting(response.data);

    return normalizeMeeting(meeting);
  },

  /* ==========================================================
     AI ACTION ITEMS
  ========================================================== */

  async extractActionItems(meetingId: string): Promise<Meeting> {
    const response = await api.patch(`/meetings/${meetingId}/action-items`);

    const meeting = extractMeeting(response.data);

    return normalizeMeeting(meeting);
  },
};

export default meetingService;
