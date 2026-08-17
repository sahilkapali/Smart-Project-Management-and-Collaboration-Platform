import api from "./api";

/**
 * =========================================================
 * AI SERVICE
 * =========================================================
 *
 * These methods use ONLY the existing backend endpoints.
 *
 * Existing backend endpoints:
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
 *
 * No backend changes are required.
 */


/* =========================================================
   TYPES

import type { Meeting } from "../types/meeting.types";

const aiService = {

  /* =======================================================
     PROJECT AI INSIGHT

     Backend:
     POST /api/ai/insight

     Request:
     {
       projectId: "..."
     }
  ======================================================= */

  getProjectInsight: async (
    projectId: string,
  ): Promise<
    AIDataResponse<AIOutput>
  > => {

    if (!projectId?.trim()) {
      throw new Error(
        "Project ID is required.",
      );
    }

    const response =
      await api.post<
        AIDataResponse<AIOutput>
      >(
        "/ai/insight",
        {
          projectId: projectId.trim(),
        },
      );

    return response.data;
  },


  /* =======================================================
     GET PROJECT AI OUTPUTS

     Backend:
     GET /api/ai/project/:projectId
  ======================================================= */

  getProjectAIOutputs: async (
    projectId: string,
  ): Promise<
    AIDataResponse<AIOutput[]>
  > => {

    if (!projectId?.trim()) {
      throw new Error(
        "Project ID is required.",
      );
    }

    const response =
      await api.get<
        AIDataResponse<AIOutput[]>
      >(
        `/ai/project/${projectId.trim()}`,
      );

    return response.data;
  },


  /* =======================================================
     GET TASK AI OUTPUTS

     Backend:
     GET /api/ai/task/:taskId
  ======================================================= */

  getTaskAIOutputs: async (
    taskId: string,
  ): Promise<
    AIDataResponse<AIOutput[]>
  > => {

    if (!taskId?.trim()) {
      throw new Error(
        "Task ID is required.",
      );
    }

    const response =
      await api.get<
        AIDataResponse<AIOutput[]>
      >(
        `/ai/task/${taskId.trim()}`,
      );

    return response.data;
  },


  /* =======================================================
     GET MEETING AI OUTPUTS

     Backend:
     GET /api/ai/meeting/:meetingId
  ======================================================= */

  getMeetingAIOutputs: async (
    meetingId: string,
  ): Promise<
    AIDataResponse<AIOutput[]>
  > => {

    if (!meetingId?.trim()) {
      throw new Error(
        "Meeting ID is required.",
      );
    }

    const response =
      await api.get<
        AIDataResponse<AIOutput[]>
      >(
        `/ai/meeting/${meetingId.trim()}`,
      );

    return response.data;
  },


  /* =======================================================
     AI TASK PRIORITIZATION

     Backend:
     PATCH /api/tasks/:id/ai-prioritize
  ======================================================= */

  prioritizeTask: async (
    taskId: string,
  ): Promise<
    AIDataResponse<AIPrioritizedTask>
  > => {

    if (!taskId?.trim()) {
      throw new Error(
        "Task ID is required.",
      );
    }

    const response =
      await api.patch<
        AIDataResponse<AIPrioritizedTask>
      >(
        `/tasks/${taskId.trim()}/ai-prioritize`,
        {},
      );

    return response.data;
  },


  /* =======================================================
     MEETING AI SUMMARY

     Backend:
     PATCH /api/meetings/:id/ai-summary
  ======================================================= */

  summarizeMeeting: async (
    meetingId: string,
  ): Promise<
    AIDataResponse<AIOutput>
  > => {

    if (!meetingId?.trim()) {
      throw new Error(
        "Meeting ID is required.",
      );
    }

    const response =
      await api.patch<
        AIDataResponse<AIOutput>
      >(
        `/meetings/${meetingId.trim()}/ai-summary`,
        {},
      );

    return response.data;
  },


  /* =======================================================
     MEETING ACTION ITEMS

     Backend:
     PATCH /api/meetings/:id/action-items
  ======================================================= */

  extractActionItems: async (
    meetingId: string,
  ): Promise<
    AIDataResponse<AIOutput>
  > => {

    if (!meetingId?.trim()) {
      throw new Error(
        "Meeting ID is required.",
      );
    }

    const response =
      await api.patch<
        AIDataResponse<AIOutput>
      >(
        `/meetings/${meetingId.trim()}/action-items`,
        {},
      );

    return response.data;
  },


  /* =======================================================
     BACKWARD COMPATIBILITY

     Some existing frontend code may call:

       aiService.autoPrioritizeTask(taskId)

     Keep this method so those components continue working.
  ======================================================= */

  autoPrioritizeTask: async (
    taskId: string,
  ): Promise<
    AIDataResponse<AIPrioritizedTask>
  > => {

    return aiService.prioritizeTask(
      taskId,
    );
  },

};


export default aiService;