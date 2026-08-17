import api from "./api";

import type {
  AIResponse,
  AIHistoryResponse,
  AIQuestionRequest,
  AITaskPriorityResponse,
} from "../types/ai.types";

import type { Meeting } from "../types/meeting.types";

const aiService = {
  // =====================================================
  // PROJECT AI INSIGHT
  // POST /api/ai/insight
  // =====================================================

  generateProjectInsight: async (
    projectId: string,
  ): Promise<AIResponse> => {
    const data: AIQuestionRequest = {
      projectId,
    };

    const response = await api.post<AIResponse>(
      "/ai/insight",
      data,
    );

    return response.data;
  },

  // =====================================================
  // PROJECT AI HISTORY
  // GET /api/ai/project/:projectId
  // =====================================================

  getProjectAIOutputs: async (
    projectId: string,
  ): Promise<AIHistoryResponse> => {
    const response =
      await api.get<AIHistoryResponse>(
        `/ai/project/${projectId}`,
      );

    return response.data;
  },

  // =====================================================
  // TASK AI PRIORITIZATION
  // PATCH /api/tasks/:id/ai-prioritize
  // =====================================================

  prioritizeTask: async (
    taskId: string,
  ): Promise<AITaskPriorityResponse> => {
    const response =
      await api.patch<AITaskPriorityResponse>(
        `/tasks/${taskId}/ai-prioritize`,
      );

    return response.data;
  },

  // =====================================================
  // TASK AI HISTORY
  // GET /api/ai/task/:taskId
  // =====================================================

  getTaskAIOutputs: async (
    taskId: string,
  ): Promise<AIHistoryResponse> => {
    const response =
      await api.get<AIHistoryResponse>(
        `/ai/task/${taskId}`,
      );

    return response.data;
  },

  // =====================================================
  // MEETING SUMMARY
  // PATCH /api/meetings/:id/ai-summary
  //
  // Backend response:
  // {
  //   success: true,
  //   message: string,
  //   data: Meeting
  // }
  // =====================================================

  summarizeMeeting: async (
    meetingId: string,
    noteId?: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: Meeting;
  }> => {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: Meeting;
    }>(
      `/meetings/${meetingId}/ai-summary`,
      noteId ? { noteId } : {},
    );

    return response.data;
  },

  // =====================================================
  // MEETING ACTION ITEMS
  // PATCH /api/meetings/:id/action-items
  //
  // Backend returns the updated Meeting.
  // =====================================================

  extractActionItems: async (
    meetingId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: Meeting;
  }> => {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: Meeting;
    }>(
      `/meetings/${meetingId}/action-items`,
      {},
    );

    return response.data;
  },

  // =====================================================
  // MEETING AI HISTORY
  // GET /api/ai/meeting/:meetingId
  // =====================================================

  getMeetingAIOutputs: async (
    meetingId: string,
  ): Promise<AIHistoryResponse> => {
    const response =
      await api.get<AIHistoryResponse>(
        `/ai/meeting/${meetingId}`,
      );

    return response.data;
  },
};

export default aiService;