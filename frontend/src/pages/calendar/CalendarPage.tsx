import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  CalendarMonthRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  CloseRounded,
  EventRounded,
  RefreshRounded,
  TaskAltRounded,
} from "@mui/icons-material";

import meetingService from "../../services/meeting.service";
import projectService from "../../services/project.service";
import taskService from "../../services/task.service";

import type { Meeting } from "../../types/meeting.types";
import type { Project } from "../../types/project.types";
import type { Task } from "../../types/task.types";

/* =========================================================
   CALENDAR EVENT
========================================================= */

type CalendarEventType = "meeting" | "task";

interface CalendarEvent {
  id: string;

  type: CalendarEventType;

  title: string;

  description?: string;

  projectId: string;

  projectName: string;

  startTime: string;

  endTime?: string;

  meetingLink?: string;

  status?: string;

  priority?: string;
}

/* =========================================================
   WEEK DAYS
========================================================= */

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* =========================================================
   HELPERS
========================================================= */

const pad = (value: number): string => {
  return String(value).padStart(2, "0");
};

/* =========================================================
   DATE KEY
========================================================= */

const getDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
};

/* =========================================================
   MONTH START
========================================================= */

const getMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/* =========================================================
   NORMALIZE DATE
========================================================= */

const normalizeDate = (
  value: string | Date | null | undefined,
): string | null => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

/* =========================================================
   FORMAT TIME
========================================================= */

const formatTime = (
  value: string | Date | null | undefined,
): string => {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   SAFE MEETING ID
========================================================= */

const getMeetingId = (meeting: Meeting): string => {
  return meeting._id ?? meeting.id ?? "";
};

/* =========================================================
   SAFE TASK ID
========================================================= */

const getTaskId = (task: Task): string => {
  return task._id ?? task.id ?? "";
};

/* =========================================================
   CALENDAR PAGE
========================================================= */

const CalendarPage = () => {
  /* =======================================================
     STATE
  ======================================================= */

  const [currentMonth, setCurrentMonth] = useState<Date>(
    getMonthStart(new Date()),
  );

  const [projects, setProjects] = useState<Project[]>([]);

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string>("");

  /*
   * IMPORTANT:
   *
   * selectedDate starts as null.
   *
   * Therefore the popup does NOT appear automatically
   * when the calendar page loads.
   *
   * It only appears after clicking Today or a date.
   */
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  /* =======================================================
     LOAD CALENDAR DATA
  ======================================================= */

  const loadCalendar = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      /* =================================================
         GET PROJECTS
      ================================================= */

      const projectList = await projectService.getProjects();

      setProjects(projectList);

      const validProjects = projectList.filter(
        (project) => Boolean(project.id),
      );

      /* =================================================
         LOAD MEETINGS + TASKS
         
         IMPORTANT:
         
         We use the EXISTING backend.
         
         Meetings:
         GET /meetings/project/:projectId
         
         Tasks:
         GET /tasks?project=:projectId
      ================================================= */

      const projectResults = await Promise.allSettled(
        validProjects.map(async (project) => {
          const projectId = project.id;

          let meetingEvents: CalendarEvent[] = [];

          let taskEvents: CalendarEvent[] = [];

          /* =================================================
             LOAD MEETINGS
          ================================================= */

          try {
            /*
             * meetingService.getProjectMeetings()
             * already returns Meeting[].
             *
             * DO NOT treat it as:
             * response.data.data
             */

            const meetings: Meeting[] =
              await meetingService.getProjectMeetings(projectId);

            meetingEvents = meetings
              .map((meeting): CalendarEvent | null => {
                const startTime = normalizeDate(meeting.startTime);

                /*
                 * A meeting must have a valid start time
                 * to appear on the calendar.
                 */

                if (!startTime) {
                  return null;
                }

                const meetingId = getMeetingId(meeting);

                if (!meetingId) {
                  return null;
                }

                const endTime = normalizeDate(meeting.endTime);

                return {
                  id: meetingId,

                  type: "meeting",

                  title: meeting.title,

                  description: meeting.description ?? "",

                  projectId,

                  projectName: project.name,

                  startTime,

                  ...(endTime
                    ? {
                        endTime,
                      }
                    : {}),

                  meetingLink: meeting.meetingLink ?? "",
                };
              })
              .filter(
                (meeting): meeting is CalendarEvent =>
                  meeting !== null,
              );
          } catch (meetingError) {
            /*
             * Do not stop task loading if meetings fail.
             */

            console.error(
              `Failed to load meetings for project ${project.name}:`,
              meetingError,
            );
          }

          /* =================================================
             LOAD TASKS
          ================================================= */

          try {
            /*
             * taskService.getTasks(projectId)
             * already calls:
             *
             * GET /tasks?project=PROJECT_ID
             */

            const taskList: Task[] =
              await taskService.getTasks(projectId);

            taskEvents = taskList
              .map((task): CalendarEvent | null => {
                /*
                 * IMPORTANT:
                 *
                 * Your backend Task model has:
                 *
                 * dueDate
                 *
                 * It does NOT have startDate.
                 *
                 * Therefore tasks are placed on the calendar
                 * according to their dueDate.
                 */

                const startTime = normalizeDate(task.dueDate);

                /*
                 * Tasks without a due date cannot be placed
                 * on a date-based calendar.
                 */

                if (!startTime) {
                  return null;
                }

                const taskId = getTaskId(task);

                if (!taskId) {
                  return null;
                }

                return {
                  id: taskId,

                  type: "task",

                  title: task.title,

                  description: task.description ?? "",

                  projectId,

                  projectName: project.name,

                  startTime,

                  status: task.status,

                  priority: task.priority,
                };
              })
              .filter(
                (task): task is CalendarEvent =>
                  task !== null,
              );
          } catch (taskError) {
            /*
             * Do not stop meeting loading if tasks fail.
             */

            console.error(
              `Failed to load tasks for project ${project.name}:`,
              taskError,
            );
          }

          /* =================================================
             RETURN PROJECT EVENTS
          ================================================= */

          return [...meetingEvents, ...taskEvents];
        }),
      );

      /* =================================================
         COMBINE ALL PROJECT EVENTS
      ================================================= */

      const loadedEvents: CalendarEvent[] = [];

      let failedProjects = 0;

      projectResults.forEach((result) => {
        if (result.status === "fulfilled") {
          loadedEvents.push(...result.value);
        } else {
          failedProjects++;

          console.error(
            "Failed to load calendar project:",
            result.reason,
          );
        }
      });

      /* =================================================
         SORT EVENTS BY DATE/TIME
      ================================================= */

      loadedEvents.sort((first, second) => {
        return (
          new Date(first.startTime).getTime() -
          new Date(second.startTime).getTime()
        );
      });

      setEvents(loadedEvents);

      /* =================================================
         PARTIAL ERROR
      ================================================= */

      if (failedProjects > 0) {
        setError(
          "Some calendar information could not be loaded. Please refresh the calendar.",
        );
      }
    } catch (err: unknown) {
      console.error("Calendar loading error:", err);

      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const axiosError = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        setError(
          axiosError.response?.data?.message ??
            "Unable to load calendar data.",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load calendar data.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  /* =======================================================
     CALENDAR DAYS
  ======================================================= */

  const calendarDays = useMemo(() => {
    const firstDay = getMonthStart(currentMonth);

    const firstWeekday = firstDay.getDay();

    /*
     * Start from the Sunday before the first day
     * of the current month.
     */

    const startDate = new Date(
      firstDay.getFullYear(),
      firstDay.getMonth(),
      1 - firstWeekday,
    );

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate);

      date.setDate(startDate.getDate() + index);

      return date;
    });
  }, [currentMonth]);

  /* =======================================================
     GROUP EVENTS BY DATE
  ======================================================= */

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();

    events.forEach((event) => {
      const eventDate = new Date(event.startTime);

      const dateKey = getDateKey(eventDate);

      const existing = grouped.get(dateKey) ?? [];

      existing.push(event);

      grouped.set(dateKey, existing);
    });

    return grouped;
  }, [events]);

  /* =======================================================
     TODAY
  ======================================================= */

  const today = new Date();

  const todayKey = getDateKey(today);

  /* =======================================================
     SELECTED DATE EVENTS
  ======================================================= */

  const selectedDateEvents = selectedDate
    ? eventsByDate.get(getDateKey(selectedDate)) ?? []
    : [];

  /* =======================================================
     MONTH NAVIGATION
  ======================================================= */

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1,
      ),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1,
      ),
    );
  };

  /* =======================================================
     TODAY BUTTON
  ======================================================= */

  const handleTodayClick = () => {
    const currentDate = new Date();

    /*
     * Move calendar to current month.
     */

    setCurrentMonth(getMonthStart(currentDate));

    /*
     * Open today's popup ONLY when the button is clicked.
     */

    setSelectedDate(currentDate);
  };

  /* =======================================================
     DATE CLICK
  ======================================================= */

  const handleDateClick = (date: Date) => {
    /*
     * Clicking ANY date opens its popup.
     */

    setSelectedDate(new Date(date));
  };

  /* =======================================================
     CLOSE POPUP
  ======================================================= */

  const closeDateDialog = () => {
    setSelectedDate(null);
  };

  /* =======================================================
     SELECTED DATE TITLE
  ======================================================= */

  const selectedDateTitle = selectedDate
    ? selectedDate.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  /* =======================================================
     IS SELECTED DATE TODAY?
  ======================================================= */

  const isSelectedDateToday = selectedDate
    ? getDateKey(selectedDate) === todayKey
    : false;

  /* =======================================================
     MONTH TITLE
  ======================================================= */

  const monthTitle = currentMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  /* =======================================================
     EVENT COUNTS
  ======================================================= */

  const meetingCount = events.filter(
    (event) => event.type === "meeting",
  ).length;

  const taskCount = events.filter(
    (event) => event.type === "task",
  ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box
      sx={{
        minHeight: "100%",
        py: {
          xs: 2,
          md: 3,
        },
        px: {
          xs: 1,
          sm: 2,
          md: 3,
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1500,
          mx: "auto",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          spacing={2}
          sx={{
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
            >
              Calendar
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              View your meetings and scheduled tasks.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
          >
            <Button
              variant="outlined"
              startIcon={<CalendarMonthRounded />}
              onClick={handleTodayClick}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Today
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshRounded />}
              onClick={() => {
                void loadCalendar();
              }}
              disabled={loading}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <Alert
            severity="warning"
            sx={{
              mb: 2,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        {/* =================================================
            CALENDAR PAPER
        ================================================= */}

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* =================================================
              CALENDAR HEADER
          ================================================= */}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
            spacing={2}
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <IconButton
                onClick={goToPreviousMonth}
                size="small"
              >
                <ChevronLeftRounded />
              </IconButton>

              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  minWidth: 180,
                  textAlign: "center",
                }}
              >
                {monthTitle}
              </Typography>

              <IconButton
                onClick={goToNextMonth}
                size="small"
              >
                <ChevronRightRounded />
              </IconButton>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
              >
                <EventRounded
                  fontSize="small"
                  color="primary"
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {meetingCount}{" "}
                  {meetingCount === 1
                    ? "Meeting"
                    : "Meetings"}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
              >
                <TaskAltRounded
                  fontSize="small"
                  color="secondary"
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {taskCount}{" "}
                  {taskCount === 1
                    ? "Task"
                    : "Tasks"}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <Box
              sx={{
                minHeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stack
                alignItems="center"
                spacing={2}
              >
                <CircularProgress />

                <Typography
                  color="text.secondary"
                >
                  Loading calendar...
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Box
              sx={{
                overflowX: "auto",
              }}
            >
              {/* =================================================
                  WEEK DAY HEADER
              ================================================= */}

              <Box
                sx={{
                  minWidth: 850,
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(7, minmax(120px, 1fr))",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                {WEEK_DAYS.map((day) => (
                  <Box
                    key={day}
                    sx={{
                      p: 1.5,
                      textAlign: "center",
                      fontWeight: 800,
                      color: "text.secondary",
                      borderRight: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {day}
                  </Box>
                ))}
              </Box>

              {/* =================================================
                  CALENDAR GRID
              ================================================= */}

              <Box
                sx={{
                  minWidth: 850,
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(7, minmax(120px, 1fr))",
                }}
              >
                {calendarDays.map((date) => {
                  const dateKey = getDateKey(date);

                  const dayEvents =
                    eventsByDate.get(dateKey) ?? [];

                  const isCurrentMonth =
                    date.getMonth() ===
                      currentMonth.getMonth() &&
                    date.getFullYear() ===
                      currentMonth.getFullYear();

                  const isToday =
                    dateKey === todayKey;

                  return (
                    <Box
                      key={dateKey}
                      onClick={() =>
                        handleDateClick(date)
                      }
                      sx={{
                        minHeight: 140,
                        p: 1,
                        cursor: "pointer",
                        borderRight: "1px solid",
                        borderBottom: "1px solid",
                        borderColor: "divider",

                        backgroundColor:
                          isToday
                            ? "action.hover"
                            : "transparent",

                        transition:
                          "background-color 0.15s ease",

                        "&:hover": {
                          backgroundColor:
                            "action.hover",
                        },
                      }}
                    >
                      {/* =================================================
                          DATE NUMBER
                      ================================================= */}

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={
                            isToday ? 800 : 600
                          }
                          sx={{
                            width: 30,
                            height: 30,
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "center",
                            borderRadius: "50%",

                            bgcolor: isToday
                              ? "primary.main"
                              : "transparent",

                            color: isToday
                              ? "primary.contrastText"
                              : isCurrentMonth
                                ? "text.primary"
                                : "text.disabled",
                          }}
                        >
                          {date.getDate()}
                        </Typography>

                        {dayEvents.length > 0 && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={700}
                          >
                            {dayEvents.length}
                          </Typography>
                        )}
                      </Stack>

                      {/* =================================================
                          EVENTS
                      ================================================= */}

                      <Stack spacing={0.5}>
                        {dayEvents
                          .slice(0, 3)
                          .map((event) => {
                            const isMeeting =
                              event.type ===
                              "meeting";

                            const startTime =
                              formatTime(
                                event.startTime,
                              );

                            return (
                              <Box
                                key={`${event.type}-${event.id}`}
                                sx={{
                                  px: 0.8,
                                  py: 0.6,
                                  borderRadius: 1.25,

                                  bgcolor:
                                    isMeeting
                                      ? "primary.main"
                                      : "secondary.main",

                                  color:
                                    isMeeting
                                      ? "primary.contrastText"
                                      : "secondary.contrastText",

                                  overflow: "hidden",
                                }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  alignItems="center"
                                >
                                  {isMeeting ? (
                                    <EventRounded
                                      sx={{
                                        fontSize: 14,
                                      }}
                                    />
                                  ) : (
                                    <TaskAltRounded
                                      sx={{
                                        fontSize: 14,
                                      }}
                                    />
                                  )}

                                  <Typography
                                    variant="caption"
                                    fontWeight={700}
                                    noWrap
                                    display="block"
                                  >
                                    {startTime
                                      ? `${startTime} `
                                      : ""}
                                    {event.title}
                                  </Typography>
                                </Stack>
                              </Box>
                            );
                          })}

                        {dayEvents.length > 3 && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              px: 0.5,
                              fontWeight: 700,
                            }}
                          >
                            +
                            {dayEvents.length - 3}{" "}
                            more
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Paper>

        {/* =================================================
            LEGEND
        ================================================= */}

        <Stack
          direction="row"
          flexWrap="wrap"
          gap={2}
          sx={{
            mt: 2,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
          >
            <EventRounded
              sx={{
                fontSize: 18,
              }}
              color="primary"
            />

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Meetings
            </Typography>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
          >
            <TaskAltRounded
              sx={{
                fontSize: 18,
              }}
              color="secondary"
            />

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Tasks
            </Typography>
          </Stack>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 1,
          }}
        >
          Calendar is view-only. Click any date to view
          its meetings and tasks.
        </Typography>

        {!loading && projects.length === 0 && (
          <Alert
            severity="info"
            sx={{
              mt: 2,
              borderRadius: 2,
            }}
          >
            No projects are available to your account.
          </Alert>
        )}
      </Box>

      {/* =====================================================
          DATE POPUP
          
          This popup appears ONLY after:
          
          1. Clicking Today
          2. Clicking any calendar date
          
          It does NOT automatically appear on page load.
      ===================================================== */}

      <Dialog
        open={selectedDate !== null}
        onClose={closeDateDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        {/* =================================================
            POPUP HEADER
        ================================================= */}

        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <CalendarMonthRounded color="primary" />

            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
              >
                {isSelectedDateToday
                  ? "Today's Schedule"
                  : "Schedule"}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {selectedDateTitle}
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={closeDateDialog}
            aria-label="Close"
          >
            <CloseRounded />
          </IconButton>
        </DialogTitle>

        <Divider />

        {/* =================================================
            POPUP CONTENT
        ================================================= */}

        <DialogContent
          sx={{
            py: 2.5,
          }}
        >
          {/* =================================================
              NOTHING SCHEDULED
          ================================================= */}

          {selectedDateEvents.length === 0 ? (
            <Box
              sx={{
                py: 4,
                textAlign: "center",
              }}
            >
              <CalendarMonthRounded
                sx={{
                  fontSize: 54,
                  color: "text.disabled",
                  mb: 1,
                }}
              />

              <Typography
                variant="h6"
                fontWeight={700}
              >
                {isSelectedDateToday
                  ? "Nothing scheduled for today"
                  : "Nothing scheduled"}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                {isSelectedDateToday
                  ? "You don't have any meetings or tasks for today."
                  : "There are no meetings or tasks scheduled for this date."}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {/* =================================================
                  EVENT COUNT
              ================================================= */}

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 0.5,
                }}
              >
                You have{" "}
                <strong>
                  {selectedDateEvents.length}
                </strong>{" "}
                scheduled{" "}
                {selectedDateEvents.length === 1
                  ? "event"
                  : "events"}{" "}
                on this date.
              </Typography>

              {/* =================================================
                  EVENTS
              ================================================= */}

              {selectedDateEvents.map((event) => {
                const isMeeting =
                  event.type === "meeting";

                const startTime = formatTime(
                  event.startTime,
                );

                const endTime = formatTime(
                  event.endTime,
                );

                return (
                  <Paper
                    key={`${event.type}-${event.id}`}
                    elevation={0}
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                    >
                      {/* =================================================
                          EVENT ICON
                      ================================================= */}

                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          minWidth: 42,
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "center",
                          borderRadius: 2,

                          bgcolor: isMeeting
                            ? "primary.main"
                            : "secondary.main",

                          color: isMeeting
                            ? "primary.contrastText"
                            : "secondary.contrastText",
                        }}
                      >
                        {isMeeting ? (
                          <EventRounded />
                        ) : (
                          <TaskAltRounded />
                        )}
                      </Box>

                      {/* =================================================
                          EVENT INFORMATION
                      ================================================= */}

                      <Box
                        sx={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          flexWrap="wrap"
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight={800}
                          >
                            {event.title}
                          </Typography>

                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,

                              bgcolor: isMeeting
                                ? "primary.50"
                                : "secondary.50",

                              color: isMeeting
                                ? "primary.main"
                                : "secondary.main",
                            }}
                          >
                            {isMeeting
                              ? "Meeting"
                              : "Task"}
                          </Typography>
                        </Stack>

                        {/* =================================================
                            PROJECT
                        ================================================= */}

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.25,
                          }}
                        >
                          Project:{" "}
                          <strong>
                            {event.projectName}
                          </strong>
                        </Typography>

                        {/* =================================================
                            TIME
                        ================================================= */}

                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            mt: 0.75,
                          }}
                        >
                          {startTime}

                          {endTime
                            ? ` - ${endTime}`
                            : ""}
                        </Typography>

                        {/* =================================================
                            TASK STATUS
                        ================================================= */}

                        {!isMeeting &&
                          event.status && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 0.5,
                              }}
                            >
                              Status:{" "}
                              <strong>
                                {event.status}
                              </strong>
                            </Typography>
                          )}

                        {/* =================================================
                            TASK PRIORITY
                        ================================================= */}

                        {!isMeeting &&
                          event.priority && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 0.5,
                              }}
                            >
                              Priority:{" "}
                              <strong>
                                {event.priority}
                              </strong>
                            </Typography>
                          )}

                        {/* =================================================
                            DESCRIPTION
                        ================================================= */}

                        {event.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.75,
                            }}
                          >
                            {event.description}
                          </Typography>
                        )}

                        {/* =================================================
                            MEETING LINK
                        ================================================= */}

                        {isMeeting &&
                          event.meetingLink && (
                            <Button
                              component="a"
                              href={
                                event.meetingLink
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                              variant="outlined"
                              sx={{
                                mt: 1,
                                textTransform:
                                  "none",
                                borderRadius: 2,
                              }}
                            >
                              Join Meeting
                            </Button>
                          )}
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </DialogContent>

        {/* =================================================
            POPUP FOOTER
        ================================================= */}

        <Divider />

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={closeDateDialog}
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarPage;