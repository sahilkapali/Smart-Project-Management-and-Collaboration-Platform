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
  // ============================================================

  /**
   * POST /api/meetings
   */
  createMeeting: async (
    data: CreateMeetingData,
  ): Promise<MeetingResponse> => {
    const response =
      await api.post<MeetingResponse>(
        "/meetings",
        data,
      );

    return response.data;
  },

  // ============================================================
  // GET PROJECT MEETINGS
  // ============================================================

  /**
   * GET /api/meetings/project/:projectId
   *
   * This is the backend endpoint available for
   * retrieving meetings.
   */
  getProjectMeetings: async (
    projectId: string,
  ): Promise<MeetingListResponse> => {
    if (!projectId) {
      throw new Error(
        "Project ID is required.",
      );
    }

    const response =
      await api.get<MeetingListResponse>(
        `/meetings/project/${projectId}`,
      );

    return response.data;
  },

  // ============================================================
  // GET SINGLE MEETING
  // ============================================================

  /**
   * GET /api/meetings/:id
   */
  getMeetingById: async (
    id: string,
  ): Promise<MeetingResponse> => {
    if (!id) {
      throw new Error(
        "Meeting ID is required.",
      );
    }

    const response =
      await api.get<MeetingResponse>(
        `/meetings/${id}`,
      );

    return response.data;
  },

  // ============================================================
  // UPDATE MEETING
  // ============================================================

  /**
   * PUT /api/meetings/:id
   */
  updateMeeting: async (
    id: string,
    data: UpdateMeetingData,
  ): Promise<MeetingResponse> => {
    if (!id) {
      throw new Error(
        "Meeting ID is required.",
      );
    }

    const response =
      await api.put<MeetingResponse>(
        `/meetings/${id}`,
        data,
      );

    return response.data;
  },

  // ============================================================
  // DELETE MEETING
  // ============================================================

  /**
   * DELETE /api/meetings/:id
   */
  deleteMeeting: async (
    id: string,
  ): Promise<void> => {
    if (!id) {
      throw new Error(
        "Meeting ID is required.",
      );
    }

    await api.delete(
      `/meetings/${id}`,
    );
  },

  // ============================================================
  // ADD MEETING NOTES
  // ============================================================

  /**
   * POST /api/meetings/:id/notes
   */
  addMeetingNotes: async (
    meetingId: string,
    notes: string,
  ): Promise<MeetingResponse> => {
    if (!meetingId) {
      throw new Error(
        "Meeting ID is required.",
      );
    }

    const response =
      await api.post<MeetingResponse>(
        `/meetings/${meetingId}/notes`,
        {
          content: notes,
        },
      );

    return response.data;
  },

  // ============================================================
  // UPDATE MEETING NOTES
  // ============================================================

  /**
   * PUT /api/meetings/:id/notes
   */
  updateMeetingNotes: async (
    meetingId: string,
    noteId: string,
    content: string,
  ): Promise<MeetingResponse> => {
    if (!meetingId) {
      throw new Error(
        "Meeting ID is required.",
      );
    }

    if (!noteId) {
      throw new Error(
        "Note ID is required.",
      );
    }

    const response =
      await api.put<MeetingResponse>(
        `/meetings/${meetingId}/notes`,
        {
          noteId,
          content,
        },
      );

    return response.data;
  },

  // ============================================================
  // PATCH MEETING NOTES
  // ============================================================

  /**
   * PATCH /api/meetings/:id/notes
   */
  patchMeetingNotes: async (
    meetingId: string,
    noteId: string,
    content: string,
  ): Promise<MeetingResponse> => {
    if (!meetingId) {
      throw new Error(
        "Meeting ID is required.",
      );
    }

    if (!noteId) {
      throw new Error(
        "Note ID is required.",
      );
    }

    const response =
      await api.patch<MeetingResponse>(
        `/meetings/${meetingId}/notes`,
        {
          noteId,
          content,
        },
      );

    return response.data;
  },

  // ============================================================
  // AI MEETING SUMMARY
  // ============================================================

  /**
   * PATCH /api/meetings/:id/ai-summary
   */
  summarizeMeeting: async (
    meetingId: string,
    noteId?: string,
  ): Promise<MeetingResponse> => {
    if (!meetingId) {
      throw new Error(
        "Meeting ID is required.",
      );
    }

    const response =
      await api.patch<MeetingResponse>(
        `/meetings/${meetingId}/ai-summary`,
        noteId
          ? { noteId }
          : {},
      );

    return response.data;
  },

  // ============================================================
  // AI ACTION ITEMS
  // ============================================================

  /**
   * PATCH /api/meetings/:id/action-items
   */
  extractActionItems: async (
    meetingId: string,
  ): Promise<MeetingResponse> => {
    if (!meetingId) {
      throw new Error(
        "Meeting ID is required.",
      );
    }

    const response =
      await api.patch<MeetingResponse>(
        `/meetings/${meetingId}/action-items`,
        {},
      );

    return response.data;
  },
};

export default meetingService;