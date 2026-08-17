export type AIOutputType =
  | "TASK_PRIORITY"
  | "MEETING_SUMMARY"
  | "ACTION_ITEMS"
  | "INSIGHT";

export interface AIOutput {
  _id?: string;

  type: AIOutputType;

  user?: string;

  project?: string;

  task?: string;

  meeting?: string;

  prompt?: string;

  output: string;

  createdAt?: string;

  updatedAt?: string;
}

export interface AIResponse {
  success?: boolean;

  message?: string;

  output?: string;

  priority?: string;

  data?:
    | AIOutput
    | {
        output?: string;
        priority?: string;
        [key: string]: unknown;
      }
    | Record<string, unknown>;
}

export interface AIHistoryResponse {
  success?: boolean;

  message?: string;

  data: AIOutput[];
}

export interface AIQuestionRequest {
  question: string;

  projectId?: string;

  taskId?: string;

  meetingId?: string;
}

export interface AITaskPriorityResponse {
  success?: boolean;

  message?: string;

  data?: {
    _id?: string;

    priority?: string;

    [key: string]: unknown;
  };
}