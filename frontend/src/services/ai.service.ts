import api from "./api";

// ============================================================
// TYPES
// ============================================================

export interface AIDataResponse<T> {
  success?: boolean;

  message?: string;

  data?: T;

  result?: T;

  output?: T;

  [key: string]: unknown;
}

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

// ============================================================
// VALIDATION
// ============================================================

const validateId = (value: string, label: string): string => {
  const id = value?.trim();

  if (!id) {
    throw new Error(`${label} is required.`);
  }

  return id;
};

// ============================================================
// AI SERVICE
// ============================================================

const aiService = {
  // ==========================================================
  // PROJECT INSIGHT
  // ==========================================================

  getProjectInsight: async (
    projectId: string,
  ): Promise<AIDataResponse<AIOutput>> => {
    const id = validateId(projectId, "Project ID");

    const response = await api.post<AIDataResponse<AIOutput>>("/ai/insight", {
      projectId: id,
    });

    return response.data;
  },

  // ==========================================================
  // PROJECT AI OUTPUTS
  // ==========================================================

  getProjectAIOutputs: async (
    projectId: string,
  ): Promise<AIDataResponse<AIOutput[]>> => {
    const id = validateId(projectId, "Project ID");

    const response = await api.get<AIDataResponse<AIOutput[]>>(
      `/ai/project/${id}`,
    );

    return response.data;
  },

  // ==========================================================
  // TASK AI OUTPUTS
  // ==========================================================

  getTaskAIOutputs: async (
    taskId: string,
  ): Promise<AIDataResponse<AIOutput[]>> => {
    const id = validateId(taskId, "Task ID");

    const response = await api.get<AIDataResponse<AIOutput[]>>(
      `/ai/task/${id}`,
    );

    return response.data;
  },

  // ==========================================================
  // MEETING AI OUTPUTS
  // ==========================================================

  getMeetingAIOutputs: async (
    meetingId: string,
  ): Promise<AIDataResponse<AIOutput[]>> => {
    const id = validateId(meetingId, "Meeting ID");

    const response = await api.get<AIDataResponse<AIOutput[]>>(
      `/ai/meeting/${id}`,
    );

    return response.data;
  },

  // ==========================================================
  // TASK PRIORITIZATION
  // ==========================================================

  prioritizeTask: async (
    taskId: string,
  ): Promise<AIDataResponse<AIPrioritizedTask>> => {
    const id = validateId(taskId, "Task ID");

    const response = await api.patch<AIDataResponse<AIPrioritizedTask>>(
      `/tasks/${id}/ai-prioritize`,
      {},
    );

    return response.data;
  },

  // ==========================================================
  // MEETING SUMMARY
  // ==========================================================

  summarizeMeeting: async (
    meetingId: string,
  ): Promise<AIDataResponse<AIOutput>> => {
    const id = validateId(meetingId, "Meeting ID");

    const response = await api.patch<AIDataResponse<AIOutput>>(
      `/meetings/${id}/ai-summary`,
      {},
    );

    return response.data;
  },

  // ==========================================================
  // ACTION ITEMS
  // ==========================================================

  extractActionItems: async (
    meetingId: string,
  ): Promise<AIDataResponse<AIOutput>> => {
    const id = validateId(meetingId, "Meeting ID");

    const response = await api.patch<AIDataResponse<AIOutput>>(
      `/meetings/${id}/action-items`,
      {},
    );

    return response.data;
  },

  // ==========================================================
  // BACKWARD COMPATIBILITY
  // ==========================================================

  autoPrioritizeTask: async (
    taskId: string,
  ): Promise<AIDataResponse<AIPrioritizedTask>> => {
    return aiService.prioritizeTask(taskId);
  },
};

export default aiService;
