import api from "./api";

import type {
  CreateMeetingData,
  MeetingResponse,
  MeetingListResponse,
  UpdateMeetingData,
} from "../types/meeting.types";

const meetingService = {
  // ============================================================
  // CREATE MEETING
  // POST /api/meetings
  // ============================================================

  createMeeting: async (data: CreateMeetingData): Promise<MeetingResponse> => {
    const response = await api.post<MeetingResponse>("/meetings", data);

    return response.data;
  },

  // ============================================================
  // GET PROJECT MEETINGS
  // GET /api/meetings/project/:projectId
  // ============================================================

  getProjectMeetings: async (
    projectId: string,
  ): Promise<MeetingListResponse> => {
    if (!projectId?.trim()) {
      throw new Error("Project ID is required.");
    }

    const response = await api.get<MeetingListResponse>(
      `/meetings/project/${projectId.trim()}`,
    );

    return response.data;
  },

  // ============================================================
  // GET MEETING BY ID
  // GET /api/meetings/:id
  // ============================================================

  getMeetingById: async (id: string): Promise<MeetingResponse> => {
    if (!id?.trim()) {
      throw new Error("Meeting ID is required.");
    }

    const response = await api.get<MeetingResponse>(`/meetings/${id.trim()}`);

    return response.data;
  },

  // ============================================================
  // UPDATE MEETING
  // PUT /api/meetings/:id
  // ============================================================

  updateMeeting: async (
    id: string,
    data: UpdateMeetingData,
  ): Promise<MeetingResponse> => {
    const response = await api.put<MeetingResponse>(`/meetings/${id}`, data);

    return response.data;
  },

  // ============================================================
  // DELETE MEETING
  // DELETE /api/meetings/:id
  // ============================================================

  deleteMeeting: async (id: string): Promise<void> => {
    await api.delete(`/meetings/${id}`);
  },

  // ============================================================
  // ADD NOTES
  // POST /api/meetings/:id/notes
  // ============================================================

  addMeetingNotes: async (
    meetingId: string,
    notes: string,
  ): Promise<MeetingResponse> => {
    const response = await api.post<MeetingResponse>(
      `/meetings/${meetingId}/notes`,
      {
        content: notes,
      },
    );

    return response.data;
  },

  // ============================================================
  // UPDATE NOTES
  // PUT /api/meetings/:id/notes
  // ============================================================

  updateMeetingNotes: async (
    meetingId: string,
    noteId: string,
    content: string,
  ): Promise<MeetingResponse> => {
    const response = await api.put<MeetingResponse>(
      `/meetings/${meetingId}/notes`,
      {
        noteId,
        content,
      },
    );

    return response.data;
  },

  // ============================================================
  // PATCH NOTES
  // PATCH /api/meetings/:id/notes
  // ============================================================

  patchMeetingNotes: async (
    meetingId: string,
    noteId: string,
    content: string,
  ): Promise<MeetingResponse> => {
    const response = await api.patch<MeetingResponse>(
      `/meetings/${meetingId}/notes`,
      {
        noteId,
        content,
      },
    );

    return response.data;
  },

  // ============================================================
  // AI SUMMARY
  // PATCH /api/meetings/:id/ai-summary
  // ============================================================

  summarizeMeeting: async (meetingId: string) => {
    const response = await api.patch(`/meetings/${meetingId}/ai-summary`, {});

    return response.data;
  },

  // ============================================================
  // AI ACTION ITEMS
  // PATCH /api/meetings/:id/action-items
  // ============================================================

  extractActionItems: async (meetingId: string) => {
    const response = await api.patch(`/meetings/${meetingId}/action-items`, {});

    return response.data;
  },
};

export default meetingService;
