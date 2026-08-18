import type { CalendarEvent as CalendarEventType } from "../../types/calendar.types";

interface CalendarEventProps {
  event: CalendarEventType;
  onClick?: (event: CalendarEventType) => void;
}

const CalendarEvent = ({ event, onClick }: CalendarEventProps) => {
  const isMeeting = event.type === "meeting";

  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="mb-1 flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isMeeting ? "bg-blue-500" : "bg-green-500"
          }`}
        />

        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {isMeeting ? "Meeting" : "Task"}
        </span>
      </div>

      <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
        {event.title}
      </h3>

      {event.projectName && (
        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
          {event.projectName}
        </p>
      )}

      {event.type === "task" && event.priority && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Priority: {event.priority}
        </p>
      )}

      {event.type === "task" && event.status && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Status: {event.status}
        </p>
      )}
    </button>
  );
};

export default CalendarEvent;
