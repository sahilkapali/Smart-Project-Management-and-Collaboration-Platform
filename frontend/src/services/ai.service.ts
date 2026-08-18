import api from "./api";

/**
 * =========================================================
 * AI SERVICE
 * =========================================================
 *
 * Existing backend endpoints:
 *
 * POST  /api/ai/insight
 * GET   /api/ai/project/:projectId
 * GET   /api/ai/task/:taskId
 * GET   /api/ai/meeting/:meetingId
 *
 * PATCH /api/tasks/:id/ai-prioritize
 * PATCH /api/meetings/:id/ai-summary
 * PATCH /api/meetings/:id/action-items
 *
 * No backend changes are required.
 */

// =========================================================
// TYPES
// =========================================================

/**
 * Generic AI response returned by the backend.
 *
 * The backend may return additional fields depending on
 * which AI operation was executed, so the response type
 * intentionally allows additional properties.
 */
export interface AIDataResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  result?: T;
  output?: T;

  [key: string]: unknown;
}

/**
 * Generic AI output.
 *
 * Different AI operations can return different structures,
 * therefore the common fields are optional.
 */
export interface AIOutput {
  id?: string;
  _id?: string;

  type?: string;
  category?: string;

  title?: string;
  summary?: string;
  content?: string;
  description?: string;

  projectId?: string;
  taskId?: string;
  meetingId?: string;

  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
}

/**
 * AI-prioritized task response.
 */
export interface AIPrioritizedTask {
  id?: string;
  _id?: string;

  taskId?: string;

  priority?: string;
  score?: number;

  reason?: string;
  explanation?: string;

  title?: string;
  description?: string;

  [key: string]: unknown;
}

// =========================================================
// HELPERS
// =========================================================

const validateId = (value: string, label: string): string => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    throw new Error(`${label} is required.`);
  }

  return trimmedValue;
};

// =========================================================
// AI SERVICE
// =========================================================

const aiService = {
  // =======================================================
  // PROJECT AI INSIGHT
  //
  // POST /api/ai/insight
  // =======================================================

  getProjectInsight: async (
    projectId: string,
  ): Promise<AIDataResponse<AIOutput>> => {
    const validProjectId = validateId(projectId, "Project ID");

    const response = await api.post<AIDataResponse<AIOutput>>("/ai/insight", {
      projectId: validProjectId,
    });

    return response.data;
  },

  // =======================================================
  // GET PROJECT AI OUTPUTS
  //
  // GET /api/ai/project/:projectId
  // =======================================================

  getProjectAIOutputs: async (
    projectId: string,
  ): Promise<AIDataResponse<AIOutput[]>> => {
    const validProjectId = validateId(projectId, "Project ID");

    const response = await api.get<AIDataResponse<AIOutput[]>>(
      `/ai/project/${validProjectId}`,
    );

    return response.data;
  },

  // =======================================================
  // GET TASK AI OUTPUTS
  //
  // GET /api/ai/task/:taskId
  // =======================================================

  getTaskAIOutputs: async (
    taskId: string,
  ): Promise<AIDataResponse<AIOutput[]>> => {
    const validTaskId = validateId(taskId, "Task ID");

    const response = await api.get<AIDataResponse<AIOutput[]>>(
      `/ai/task/${validTaskId}`,
    );

    return response.data;
  },

  // =======================================================
  // GET MEETING AI OUTPUTS
  //
  // GET /api/ai/meeting/:meetingId
  // =======================================================

  getMeetingAIOutputs: async (
    meetingId: string,
  ): Promise<AIDataResponse<AIOutput[]>> => {
    const validMeetingId = validateId(meetingId, "Meeting ID");

    const response = await api.get<AIDataResponse<AIOutput[]>>(
      `/ai/meeting/${validMeetingId}`,
    );

    return response.data;
  },

  // =======================================================
  // AI TASK PRIORITIZATION
  //
  // PATCH /api/tasks/:id/ai-prioritize
  // =======================================================

  prioritizeTask: async (
    taskId: string,
  ): Promise<AIDataResponse<AIPrioritizedTask>> => {
    const validTaskId = validateId(taskId, "Task ID");

    const response = await api.patch<AIDataResponse<AIPrioritizedTask>>(
      `/tasks/${validTaskId}/ai-prioritize`,
      {},
    );

    return response.data;
  },

  // =======================================================
  // MEETING AI SUMMARY
  //
  // PATCH /api/meetings/:id/ai-summary
  // =======================================================

  summarizeMeeting: async (
    meetingId: string,
  ): Promise<AIDataResponse<AIOutput>> => {
    const validMeetingId = validateId(meetingId, "Meeting ID");

    const response = await api.patch<AIDataResponse<AIOutput>>(
      `/meetings/${validMeetingId}/ai-summary`,
      {},
    );

    return response.data;
  },

  // =======================================================
  // MEETING ACTION ITEMS
  //
  // PATCH /api/meetings/:id/action-items
  // =======================================================

  extractActionItems: async (
    meetingId: string,
  ): Promise<AIDataResponse<AIOutput>> => {
    const validMeetingId = validateId(meetingId, "Meeting ID");

    const response = await api.patch<AIDataResponse<AIOutput>>(
      `/meetings/${validMeetingId}/action-items`,
      {},
    );

    return response.data;
  },

  // =======================================================
  // BACKWARD COMPATIBILITY
  //
  // Some existing frontend components may call:
  //
  // aiService.autoPrioritizeTask(taskId)
  //
  // Keep this alias so those components continue working.
  // =======================================================

  autoPrioritizeTask: async (
    taskId: string,
  ): Promise<AIDataResponse<AIPrioritizedTask>> => {
    return aiService.prioritizeTask(taskId);
  },
};

export default aiService;
