import api from "./api";

import type {
  AIHistoryResponse,
  AIResponse,
  AITaskPriorityResponse,
} from "../types/ai.types";

import type {
  MeetingResponse,
} from "../types/meeting.types";

/**
 * ============================================================
 * AI SERVICE
 * ============================================================
 *
 * IMPORTANT:
 * This service ONLY communicates with the existing backend.
 *
 * It does NOT call Gemini directly from the browser.
 *
 * Backend endpoints:
 *
 * POST  /api/ai/insight
 * GET   /api/ai/project/:projectId
 * GET   /api/ai/task/:taskId
 * GET   /api/ai/meeting/:meetingId
 *
 * PATCH /api/tasks/:id/ai-prioritize
 *
 * PATCH /api/meetings/:id/ai-summary
 * PATCH /api/meetings/:id/action-items
 * ============================================================
 */

const aiService = {
  // ==========================================================
  // PROJECT AI INSIGHT
  // ==========================================================

  /**
   * POST /api/ai/insight
   *
   * Backend expects:
   *
   * {
   *   projectId: string
   * }
   */
  generateProjectInsight: async (
    projectId: string,
  ) => {
    if (!projectId) {
      throw new Error(
        "Project ID is required.",
      );
    }

    return api.post<AIResponse>(
      "/ai/insight",
      {
        projectId,
      },
    );
  },

  // ==========================================================
  // PROJECT AI HISTORY
  // ==========================================================

  /**
   * GET /api/ai/project/:projectId
   */
  getProjectAIOutputs: async (
    projectId: string,
  ) => {
    if (!projectId) {
      throw new Error(
        "Project ID is required.",
      );
    }

    return api.get<AIHistoryResponse>(
      `/ai/project/${projectId}`,
    );
  },

  // ==========================================================
  // TASK AI PRIORITIZATION
  // ==========================================================

  /**
   * PATCH /api/tasks/:id/ai-prioritize
   *
   * Backend returns the updated Task.
   */
  prioritizeTask: async (
    taskId: string,
  ) => {
    if (!taskId) {
      throw new Error(
        "Task ID is required.",
      );
    }

    return api.patch<AITaskPriorityResponse>(
      `/tasks/${taskId}/ai-prioritize`,
    );
  },

  // ==========================================================
  // TASK AI HISTORY
  // ==========================================================

  /**
   * GET /api/ai/task/:taskId
   */
  getTaskAIOutputs: async (
    taskId: string,
  ) => {
    if (!taskId) {
      throw new Error(
        "Task ID is required.",
      );
    }

    return api.get<AIHistoryResponse>(
      `/ai/task/${taskId}`,
    );
  },

  // ==========================================================
  // MEETING AI SUMMARY
  // ==========================================================

  /**
   * PATCH /api/meetings/:id/ai-summary
   *
   * The backend accepts an optional noteId.
   *
   * When noteId is supplied, the backend summarizes
   * that specific meeting note.
   *
   * When noteId is omitted, the backend summarizes
   * the latest meeting note.
   */
  summarizeMeeting: async (
    meetingId: string,
    noteId?: string,
  ) => {
    if (!meetingId) {
      throw new Error(
        "Meeting ID is required.",
      );
    }

    const body = noteId
      ? {
          noteId,
        }
      : {};

    return api.patch<MeetingResponse>(
      `/meetings/${meetingId}/ai-summary`,
      body,
    );
  },

  // ==========================================================
  // MEETING ACTION ITEMS
  // ==========================================================

  /**
   * PATCH /api/meetings/:id/action-items
   *
   * Backend analyzes ALL meeting notes.
   */
  extractActionItems: async (
    meetingId: string,
  ) => {
    if (!meetingId) {
      throw new Error(
        "Meeting ID is required.",
      );
    }

    return api.patch<MeetingResponse>(
      `/meetings/${meetingId}/action-items`,
      {},
    );
  },

  // ==========================================================
  // MEETING AI HISTORY
  // ==========================================================

  /**
   * GET /api/ai/meeting/:meetingId
   */
  getMeetingAIOutputs: async (
    meetingId: string,
  ) => {
    if (!meetingId) {
      throw new Error(
        "Meeting ID is required.",
      );
    }

    return api.get<AIHistoryResponse>(
      `/ai/meeting/${meetingId}`,
    );
  },
};

export default aiService;