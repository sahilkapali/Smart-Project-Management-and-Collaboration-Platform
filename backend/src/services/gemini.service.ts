import { gemini } from "../config/gemini";

// =====================================================
// GEMINI MODEL
// =====================================================

const MODEL_NAME = "gemini-3.1-flash-lite";

// =====================================================
// TYPES
// =====================================================

export type TaskPriority = "Low" | "Medium" | "High" | "Critical";

export interface AITaskPriorityResult {
  taskId: string;
  priority: TaskPriority;
  reason: string;
}

// =====================================================
// GENERIC GEMINI GENERATION
// =====================================================

export const generateAIResponse = async (prompt: string): Promise<string> => {
  if (!prompt.trim()) {
    throw new Error("AI prompt cannot be empty");
  }

  const response = await gemini.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text.trim();
};

// =====================================================
// GENERAL PROJECT INSIGHT
// =====================================================

export const generateProjectInsight = async (
  projectContext: string,
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
// AI PROJECT REPORT SUMMARY
// =====================================================

export const generateProjectReportSummary = async (
  reportContext: string,
): Promise<string> => {
  const prompt = `
You are an AI project management assistant.

Analyze the following project report data and generate a concise executive
summary for a project manager.

Project report:
${reportContext}

Your response MUST contain these sections:

Overall Summary:
Write 2-4 sentences describing the current state of the project.

Task Progress:
Explain how the project is progressing based on the task statistics.
Mention the completion percentage.

Issue Status:
Explain the current issue situation.
Mention the number of open, in-progress, and resolved issues.

Risks and Concerns:
Identify important risks or concerns based ONLY on the supplied data.
Do not invent information.

Recommended Actions:
Provide 3-5 practical actions the project manager should consider.

Keep the language professional, concise, and easy to understand.

Do not mention that you are an AI.
Do not invent project information.
`;

  return generateAIResponse(prompt);
};

// =====================================================
// PRIORITIZE ALL PROJECT TASKS
// =====================================================

export const prioritizeProjectTasks = async (
  tasksContext: string,
): Promise<AITaskPriorityResult[]> => {
  if (!tasksContext.trim()) {
    throw new Error("Task context cannot be empty.");
  }

  const prompt = `
You are an expert AI project management assistant.

Your job is to prioritize ALL tasks in the supplied project by comparing
them against each other.

The goal is NOT to mark every overdue or important task as Critical.

You must distinguish between:
- urgency
- project impact
- blocking importance
- deadline pressure
- current progress
- consequence of delay

=====================================================
IMPORTANT PRIORITIZATION PRINCIPLE
=====================================================

Do NOT automatically assign Critical simply because a task is overdue.

An overdue task can be High or Medium depending on its actual impact.

Critical should be rare.

Use Critical ONLY when the task has an exceptionally serious combination
of urgency and project impact.

=====================================================
PRIORITIZATION FACTORS
=====================================================

Evaluate ALL of these factors together.

1. DEADLINE / URGENCY

Consider:
- how overdue the task is
- how soon the task is due
- whether the deadline is immediate
- whether missing the deadline creates serious consequences

Being overdue alone does NOT automatically mean Critical.

2. PROJECT IMPACT

Consider how much the task affects overall project completion.

Examples of high impact:
- core project functionality
- authentication/security
- major project deliverables
- features required by many other modules

However, high impact alone does NOT automatically mean Critical.

3. BLOCKING WORK

If the task clearly blocks other important project work,
increase its priority.

Only use Critical when the blocking effect is severe and urgent.

4. CURRENT STATUS

Todo:
Evaluate normally based on urgency and impact.

In Progress:
Work already underway may deserve higher priority when it is
important and close to completion.

Completed:
Normally Low because it no longer requires active work.

5. DESCRIPTION

Use the task title and description to identify:
- importance
- urgency
- dependencies
- blocking work
- project impact
- deliverables
- security concerns
- consequences of delay

=====================================================
PRIORITY LEVELS
=====================================================

CRITICAL

Use this sparingly.

A task should be Critical only when there is a strong reason that
immediate attention is required.

Typical examples:

- Severe security or production issue
- Extremely urgent major deliverable
- Severely overdue task with major consequences
- Task currently blocking several important tasks
- Immediate deadline combined with very high project impact
- Failure to complete the task could seriously threaten project completion

IMPORTANT:

Do NOT assign Critical merely because:
- the task is overdue
- the task is important
- the task is foundational
- the task is in progress

At least one exceptional circumstance should justify Critical.

HIGH

Use when a task is important and should be addressed soon.

Typical examples:

- Important task that is overdue
- Important project module
- Significant project impact
- Important work currently in progress
- Task with a near deadline
- Task that affects other work but is not an immediate critical blocker

MEDIUM

Use for normal project work.

Typical examples:

- Moderate importance
- Reasonable project impact
- Some urgency but no immediate danger
- Task that should be completed but can wait behind higher priority work

LOW

Use when the task can reasonably wait.

Typical examples:

- Minor supporting work
- Low project impact
- No meaningful deadline pressure
- Documentation or cleanup work
- Completed task
- Task that does not block important work

=====================================================
COMPARATIVE PRIORITIZATION
=====================================================

You MUST compare the complete task list before assigning priorities.

Do not evaluate each task independently.

For example:

If there are two overdue tasks:
- one has extremely high impact and blocks major project work
- one is overdue but has moderate impact

the first should receive the higher priority.

But the second should NOT automatically become Critical merely because
it is overdue.

Use the following general ordering:

Critical = exceptional immediate risk
High = important and urgent
Medium = normal important work
Low = can safely wait

Multiple tasks MAY have the same priority.

Do NOT artificially create different priorities simply to make the
results look varied.

=====================================================
IMPORTANT RULES
=====================================================

1. Every supplied task MUST appear exactly once.

2. Do NOT create new tasks.

3. Do NOT remove tasks.

4. Do NOT modify task IDs.

5. Use the exact task IDs supplied in the task information.

6. Each task must receive exactly ONE priority.

7. Each task must receive a short reason.

8. The reason must explain the actual factors that caused the priority.

9. Do NOT invent information.

10. Completed tasks should normally be Low.

11. Overdue does NOT automatically mean Critical.

12. Important does NOT automatically mean Critical.

13. Foundational does NOT automatically mean Critical.

14. In Progress does NOT automatically mean Critical.

15. Critical should be used sparingly and only when clearly justified.

16. Compare ALL tasks before deciding.

17. Return ONLY valid JSON.

18. Do NOT return markdown.

19. Do NOT return \`\`\`json.

20. Do NOT include any text before or after the JSON.

=====================================================
REQUIRED RESPONSE FORMAT
=====================================================

[
  {
    "taskId": "EXACT_TASK_ID",
    "priority": "Critical",
    "reason": "Short explanation of why this task has this priority."
  }
]

=====================================================
PROJECT TASKS
=====================================================

${tasksContext}
`;

  const result = await generateAIResponse(prompt);

  // -----------------------------------------------------
  // Parse JSON
  // -----------------------------------------------------

  let parsed: unknown;

  try {
    parsed = JSON.parse(result);
  } catch {
    // Gemini may occasionally return JSON wrapped in markdown
    // even when explicitly instructed not to.
    const jsonMatch = result.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error(
        "Gemini returned invalid JSON for project task prioritization.",
      );
    }

    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error(
        "Gemini returned malformed JSON for project task prioritization.",
      );
    }
  }

  // -----------------------------------------------------
  // Validate response type
  // -----------------------------------------------------

  if (!Array.isArray(parsed)) {
    throw new Error("Gemini task prioritization response must be an array.");
  }

  if (parsed.length === 0) {
    throw new Error("Gemini returned an empty task prioritization response.");
  }

  // -----------------------------------------------------
  // Allowed priorities
  // -----------------------------------------------------

  const allowedPriorities: TaskPriority[] = [
    "Low",
    "Medium",
    "High",
    "Critical",
  ];

  // -----------------------------------------------------
  // Validate every result
  // -----------------------------------------------------

  const results: AITaskPriorityResult[] = [];

  const receivedTaskIds = new Set<string>();

  for (const item of parsed) {
    if (!item || typeof item !== "object") {
      throw new Error("Gemini returned an invalid task priority item.");
    }

    const candidate = item as Record<string, unknown>;

    // ---------------------------------------------------
    // Validate task ID
    // ---------------------------------------------------

    if (typeof candidate.taskId !== "string" || !candidate.taskId.trim()) {
      throw new Error("Gemini returned a task without a valid taskId.");
    }

    const taskId = candidate.taskId.trim();

    // ---------------------------------------------------
    // Reject duplicate task IDs
    // ---------------------------------------------------

    if (receivedTaskIds.has(taskId)) {
      throw new Error(`Gemini returned duplicate task ID: ${taskId}`);
    }

    receivedTaskIds.add(taskId);

    // ---------------------------------------------------
    // Validate priority
    // ---------------------------------------------------

    if (
      typeof candidate.priority !== "string" ||
      !allowedPriorities.includes(candidate.priority as TaskPriority)
    ) {
      throw new Error(
        `Gemini returned an invalid priority for task ${taskId}.`,
      );
    }

    // ---------------------------------------------------
    // Validate reason
    // ---------------------------------------------------

    const reason =
      typeof candidate.reason === "string" ? candidate.reason.trim() : "";

    results.push({
      taskId,
      priority: candidate.priority as TaskPriority,
      reason,
    });
  }

  return results;
};

// =====================================================
// SINGLE TASK PRIORITIZATION
// =====================================================
// Kept for backward compatibility.
//
// IMPORTANT:
// The project-level "AI Task Prioritize" button should use
// prioritizeProjectTasks() instead of this function.
// =====================================================

export const prioritizeTask = async (taskContext: string): Promise<string> => {
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
// LEGACY SINGLE TASK PRIORITY
// =====================================================
// Kept because other parts of the application may still use it.
// =====================================================

export const generateTaskPriority = async (
  taskContext: string,
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

Return ONLY one word.

Do not provide an explanation.
Do not return JSON.
Do not use markdown.
`;

  const result = await generateAIResponse(prompt);

  const normalized = result
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  if (normalized === "critical") {
    return "Critical";
  }

  if (normalized === "high") {
    return "High";
  }

  if (normalized === "medium") {
    return "Medium";
  }

  if (normalized === "low") {
    return "Low";
  }

  throw new Error(`Invalid AI priority returned: ${result}`);
};

// =====================================================
// MEETING SUMMARY
// =====================================================

export const generateMeetingSummary = async (
  meetingText: string,
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
  meetingText: string,
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
