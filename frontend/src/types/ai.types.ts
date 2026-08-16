export interface AIResponse {
  success: boolean;
  message?: string;
  data?: {
    response?: string;
    answer?: string;
    summary?: string;
    actionItems?: string[];
    [key: string]: unknown;
  };
}

export interface AIQuestionRequest {
  question: string;
}

export interface AISummaryResponse {
  success: boolean;
  message?: string;
  data?: {
    summary?: string;
    [key: string]: unknown;
  };
}

export interface AIActionItemsResponse {
  success: boolean;
  message?: string;
  data?: {
    actionItems?: string[];
    [key: string]: unknown;
  };
}