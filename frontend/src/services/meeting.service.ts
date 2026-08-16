import api from "./api";
import type {
  CreateMeetingData,
  MeetingResponse,
  MeetingListResponse,
  UpdateMeetingData,
} from "../types/meeting.types";

const meetingService = {
  /**
   * Create a meeting
   * POST /api/meetings
   */
  createMeeting: async (
    data: CreateMeetingData,
  ): Promise<MeetingResponse> => {
    const response = await api.post<MeetingResponse>(
      "/meetings",
      data,
    );

    return response.data;
  },

  /**
   * Get meetings for a project
   * GET /api/meetings/project/:projectId
   */
  getProjectMeetings: async (
    projectId: string,
  ): Promise<MeetingListResponse> => {
    const response = await api.get<MeetingListResponse>(
      `/meetings/project/${projectId}`,
    );

    return response.data;
  },

  /**
   * Get one meeting
   * GET /api/meetings/:id
   */
  getMeetingById: async (
    id: string,
  ): Promise<MeetingResponse> => {
    const response = await api.get<MeetingResponse>(
      `/meetings/${id}`,
    );

    return response.data;
  },

  /**
   * Update meeting
   * PUT /api/meetings/:id
   */
  updateMeeting: async (
    id: string,
    data: UpdateMeetingData,
  ): Promise<MeetingResponse> => {
    const response = await api.put<MeetingResponse>(
      `/meetings/${id}`,
      data,
    );

    return response.data;
  },

  /**
   * Delete meeting
   * DELETE /api/meetings/:id
   */
  deleteMeeting: async (
    id: string,
  ): Promise<void> => {
    await api.delete(`/meetings/${id}`);
  },

  /**
   * Add meeting notes
   * POST /api/meetings/:id/notes
   */
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

  /**
   * Update meeting notes
   * PUT /api/meetings/:id/notes
   */
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

  /**
   * Partially update meeting notes
   * PATCH /api/meetings/:id/notes
   */
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

  /**
   * Generate AI summary for a meeting note
   * PATCH /api/meetings/:id/ai-summary
   */
  summarizeMeeting: async (
    meetingId: string,
    noteId?: string,
  ): Promise<MeetingResponse> => {
    const response = await api.patch<MeetingResponse>(
      `/meetings/${meetingId}/ai-summary`,
      noteId ? { noteId } : {},
    );

    return response.data;
  },

  /**
   * Extract action items from meeting notes
   * PATCH /api/meetings/:id/action-items
   */
  extractActionItems: async (
    meetingId: string,
  ): Promise<MeetingResponse> => {
    const response = await api.patch<MeetingResponse>(
      `/meetings/${meetingId}/action-items`,
      {},
    );

    return response.data;
  },
};

export default meetingService;