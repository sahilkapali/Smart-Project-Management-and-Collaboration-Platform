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
========================================================= */

export interface AIOutput {
  _id?: string;
  id?: string;

  type?: string;

  user?:
    | string
    | {
        _id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      };

  project?:
    | string
    | {
        _id?: string;
        name?: string;
      };

  task?:
    | string
    | {
        _id?: string;
        title?: string;
      };

  meeting?:
    | string
    | {
        _id?: string;
        title?: string;
      };

  prompt?: string;

  output?: string;

  response?: string;

  answer?: string;

  summary?: string;

  createdAt?: string;

  updatedAt?: string;

  [key: string]: unknown;
}


/* =========================================================
   GENERIC API RESPONSE
========================================================= */

export interface AIDataResponse<T = unknown> {
  success?: boolean;

  message?: string;

  data?: T;

  [key: string]: unknown;
}


/* =========================================================
   TASK PRIORITIZATION
========================================================= */

export interface AIPrioritizedTask {
  _id?: string;

  id?: string;

  title?: string;

  description?: string;

  status?:
    | "Todo"
    | "In Progress"
    | "Completed";

  priority?:
    | "Low"
    | "Medium"
    | "High"
    | "Critical";

  project?: unknown;

  assignedTo?: unknown;

  dueDate?: string;

  createdBy?: unknown;

  overdue?: boolean;

  [key: string]: unknown;
}


/* =========================================================
   AI SERVICE
========================================================= */

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