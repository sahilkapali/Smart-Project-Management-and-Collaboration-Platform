export interface AIQuestionRequest {
  projectId: string;
}

export interface AIResponse {
  success: boolean;
  message?: string;
  data?: AIOutput;
}

export interface AIOutput {
  _id?: string;

  type:
    | "INSIGHT"
    | "TASK_PRIORITY"
    | "MEETING_SUMMARY"
    | "ACTION_ITEMS";

  user?: string;

  project?: string;

  task?: string;

  meeting?: string;

  prompt?: string;

  output: string;

  createdAt?: string;

  updatedAt?: string;

  [key: string]: unknown;
}

export interface AIHistoryResponse {
  success: boolean;
  message?: string;
  data?: AIOutput[];
}

/**
 * Backend response from:
 * PATCH /api/tasks/:id/ai-prioritize
 */
export interface AITaskPriorityResponse {
  success: boolean;
  message?: string;
  data?: TaskPriorityData;
}

export interface TaskPriorityData {
  _id?: string;
  title?: string;
  description?: string;

  priority?:
    | "Low"
    | "Medium"
    | "High"
    | "Critical";

  status?: string;

  dueDate?: string;

  [key: string]: unknown;
}

/**
 * Backend response from:
 * PATCH /api/meetings/:id/ai-summary
 */
export interface AIMeetingSummaryResponse {
  success: boolean;
  message?: string;
  data?: MeetingAIData;
}

/**
 * Backend response from:
 * PATCH /api/meetings/:id/action-items
 */
export interface AIActionItemsResponse {
  success: boolean;
  message?: string;
  data?: MeetingAIData;
}

export interface MeetingAIData {
  _id?: string;

  title?: string;

  notes?: MeetingNote[];

  actionItems?: string[];

  [key: string]: unknown;
}

export interface MeetingNote {
  _id?: string;

  content: string;

  aiGeneratedSummary?: string;

  createdAt?: string;

  updatedAt?: string;
}