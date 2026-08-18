export type CalendarEventType = "meeting" | "task";

export interface CalendarEvent {
  id: string;
  title: string;

  type: CalendarEventType;

  start: Date;
  end: Date;

  projectId: string;
  projectName?: string;

  description?: string;

  status?: string;
  priority?: string;

  meetingLink?: string;

  assignedTo?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
  } | null;
}

export interface CalendarFilters {
  showMeetings: boolean;
  showTasks: boolean;
  projectId?: string;
}
