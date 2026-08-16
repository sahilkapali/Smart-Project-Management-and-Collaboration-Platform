import api from "./api";
import type {
  AIQuestionRequest,
  AIResponse,
} from "../types/ai.types";

const aiService = {
  /**
   * Send a general question to the AI.
   *
   * Change "/ai/ask" if your backend ai.routes.ts
   * uses another endpoint.
   */
  askAI: async (
    data: AIQuestionRequest,
  ): Promise<AIResponse> => {
    const response = await api.post<AIResponse>(
      "/ai/ask",
      data,
    );

    return response.data;
  },

  /**
   * Generate a meeting summary.
   *
   * This is optional because your meeting controller
   * already has /meetings/:id/ai-summary.
   */
  summarizeMeeting: async (
    meetingId: string,
    noteId?: string,
  ): Promise<AIResponse> => {
    const response = await api.patch<AIResponse>(
      `/meetings/${meetingId}/ai-summary`,
      noteId ? { noteId } : {},
    );

    return response.data;
  },

  /**
   * Extract meeting action items.
   */
  extractActionItems: async (
    meetingId: string,
  ): Promise<AIResponse> => {
    const response = await api.patch<AIResponse>(
      `/meetings/${meetingId}/action-items`,
      {},
    );

    return response.data;
  },
};

export default aiService;