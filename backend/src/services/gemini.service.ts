import { gemini } from '../config/gemini';

// =====================================================
// GEMINI MODEL
// =====================================================

const MODEL_NAME = 'gemini-2.5-flash';


// =====================================================
// TYPES
// =====================================================

export type TaskPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';


// =====================================================
// GENERIC GEMINI GENERATION
// =====================================================

export const generateAIResponse = async (
  prompt: string
): Promise<string> => {

  if (!prompt.trim()) {
    throw new Error('AI prompt cannot be empty');
  }

  const response = await gemini.models.generateContent({
    model: MODEL_NAME,
    contents: prompt
  });

  const text = response.text;

  if (!text) {
    throw new Error('Gemini returned an empty response');
  }

  return text.trim();
};


// =====================================================
// GENERAL PROJECT INSIGHT
// =====================================================

export const generateProjectInsight = async (
  projectContext: string
): Promise<string> => {

  const prompt = `
You are an AI project management assistant.

Analyze the following project information and provide useful project insights.

Project information:
${projectContext}

Provide:

1. Current project situation
2. Major risks or problems
3. Important observations
4. Recommended actions

Keep the response practical and concise.
`;

  return generateAIResponse(prompt);
};


// =====================================================
// TASK PRIORITIZATION
// =====================================================

export const prioritizeTask = async (
  taskContext: string
): Promise<string> => {

  const prompt = `
You are an AI project management assistant.

Analyze the following task information and recommend its priority.

Task information:
${taskContext}

Return the result in this format:

Priority: HIGH | MEDIUM | LOW | CRITICAL

Reason:

Recommended action:
`;

  return generateAIResponse(prompt);
};


// =====================================================
// GENERATE TASK PRIORITY
// Used by task.controller.ts
// =====================================================

export const generateTaskPriority = async (
  taskContext: string
): Promise<TaskPriority> => {

  const prompt = `
You are an AI project management assistant.

Analyze the following task and determine its priority.

Task information:
${taskContext}

Choose exactly ONE priority from:

LOW
MEDIUM
HIGH
CRITICAL

Priority guidelines:

LOW:
- Minor task
- Low urgency
- Little impact if delayed

MEDIUM:
- Normal project task
- Moderate importance
- Some impact if delayed

HIGH:
- Important task
- Significant impact on the project
- Should be completed soon

CRITICAL:
- Urgent or blocking task
- Major impact on project completion
- Must be handled immediately

Return ONLY one word:

LOW
MEDIUM
HIGH
CRITICAL

Do not provide an explanation.
Do not return JSON.
Do not use markdown.
`;

  const result = await generateAIResponse(prompt);

  const priority = result
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, '');

  if (priority === 'critical') {
    return 'critical';
  }

  if (priority === 'high') {
    return 'high';
  }

  if (priority === 'medium') {
    return 'medium';
  }

  return 'low';
};


// =====================================================
// MEETING SUMMARY
// =====================================================

export const generateMeetingSummary = async (
  meetingText: string
): Promise<string> => {

  const prompt = `
You are an AI meeting assistant.

Summarize the following meeting notes/transcript.

Meeting content:
${meetingText}

Provide:

Summary:

Key Decisions:

- decision 1
- decision 2

Important Discussion Points:

- point 1
- point 2
`;

  return generateAIResponse(prompt);
};


// =====================================================
// ACTION ITEMS
// =====================================================

export const generateActionItems = async (
  meetingText: string
): Promise<string> => {

  const prompt = `
You are an AI project management assistant.

Extract actionable tasks from the following meeting notes/transcript.

Meeting content:
${meetingText}

Return:

Action Items:

1. Task
2. Task
3. Task

For each task include an assignee if one is explicitly mentioned.

Do not invent assignees.
`;

  return generateAIResponse(prompt);
};