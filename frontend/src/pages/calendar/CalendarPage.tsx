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
  Tooltip,
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
   CALENDAR EVENT TYPE
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

const pad = (value: number): string => String(value).padStart(2, "0");

/* =========================================================
   DATE KEY
========================================================= */

const getDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/* =========================================================
   MONTH START
========================================================= */

const getMonthStart = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

/* =========================================================
   SAFE ID
========================================================= */

const getProjectId = (project: Project): string => {
  /*
   * Your Project type uses `id`.
   *
   * Do not access project._id because
   * TypeScript correctly reports that
   * `_id` does not exist on Project.
   */

  return project.id;
};

/* =========================================================
   SAFE MEETING ID
========================================================= */

const getMeetingId = (meeting: Meeting): string => {
  /*
   * Your Meeting type uses `_id`.
   *
   * Do not use meeting.id.
   */

  return meeting._id;
};

/* =========================================================
   SAFE DATE STRING
========================================================= */

const normalizeDate = (
  value: string | Date | undefined | null,
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

const formatTime = (value: string | Date | undefined): string => {
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
   CALENDAR PAGE
========================================================= */

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    getMonthStart(new Date()),
  );

  const [projects, setProjects] = useState<Project[]>([]);

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string>("");

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  /* =======================================================
     LOAD CALENDAR
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

      /*
       * Only projects with a valid `id`
       * are used.
       */

      const validProjects = projectList.filter((project) =>
        Boolean(project.id),
      );

      /* =================================================
           LOAD MEETINGS + TASKS
        ================================================= */

      const results = await Promise.allSettled(
        validProjects.map(async (project) => {
          const projectId = getProjectId(project);

          /* =========================================
                   MEETINGS
                ========================================= */

          const meetingResponse =
            await meetingService.getProjectMeetings(projectId);

          if (!meetingResponse.success) {
            throw new Error(
              meetingResponse.message ||
                `Unable to load meetings for ${project.name}.`,
            );
          }

          /*
           * Normalize meetings into
           * CalendarEvent.
           */

          const meetingEvents: CalendarEvent[] = (meetingResponse.data ?? [])
            .map((meeting): CalendarEvent | null => {
              const startTime = normalizeDate(meeting.startTime);

              if (!startTime) {
                return null;
              }

              const endTime = normalizeDate(meeting.endTime);

              return {
                id: getMeetingId(meeting),

                type: "meeting",

                title: meeting.title,

                description: meeting.description,

                projectId,

                projectName: project.name,

                startTime,

                ...(endTime
                  ? {
                      endTime,
                    }
                  : {}),

                meetingLink: meeting.meetingLink,
              };
            })
            .filter((meeting): meeting is CalendarEvent => meeting !== null);

          /* =========================================
                   TASKS
                ========================================= */

          /*
           * IMPORTANT:
           *
           * Your task service exposes:
           *
           * getTasks(projectId)
           *
           * NOT:
           *
           * getProjectTasks(projectId)
           */

          const taskList = await taskService.getTasks(projectId);

          /*
           * Normalize tasks into
           * CalendarEvent.
           */

          const taskEvents: CalendarEvent[] = taskList
            .map((task): CalendarEvent | null => {
              /*
               * We need a task date.
               *
               * Prefer dueDate.
               *
               * If dueDate does not exist,
               * fall back to startDate.
               */

              const rawStartDate = task.dueDate ?? task.startDate;

              const startTime = normalizeDate(rawStartDate);

              /*
               * Tasks without a usable
               * date cannot appear on
               * the calendar.
               */

              if (!startTime) {
                return null;
              }

              /*
               * Task ID.
               *
               * Your Task type should
               * expose `_id`.
               */

              const taskId = task._id;

              if (!taskId) {
                return null;
              }

              return {
                id: taskId,

                type: "task",

                title: task.title,

                description: task.description,

                projectId,

                projectName: project.name,

                startTime,

                status: task.status,

                priority: task.priority,
              };
            })
            .filter((task): task is CalendarEvent => task !== null);

          return [...meetingEvents, ...taskEvents];
        }),
      );

      /* =================================================
           COMBINE ALL EVENTS
        ================================================= */

      const loadedEvents: CalendarEvent[] = [];

      let failedRequests = 0;

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          loadedEvents.push(...result.value);
        } else {
          failedRequests++;

          console.error("Failed to load calendar project:", result.reason);
        }
      });

      /* =================================================
           SORT EVENTS
        ================================================= */

      loadedEvents.sort(
        (first, second) =>
          new Date(first.startTime).getTime() -
          new Date(second.startTime).getTime(),
      );

      setEvents(loadedEvents);

      /* =================================================
           PARTIAL ERROR
        ================================================= */

      if (failedRequests > 0 && validProjects.length > 0) {
        setError(
          "Some project meetings or tasks could not be loaded. Please refresh the calendar.",
        );
      }
    } catch (err: unknown) {
      console.error("Calendar loading error:", err);

      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        setError(
          axiosError.response?.data?.message || "Unable to load calendar data.",
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
      const dateKey = getDateKey(new Date(event.startTime));

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
    ? (eventsByDate.get(getDateKey(selectedDate)) ?? [])
    : [];

  /* =======================================================
     MONTH NAVIGATION
  ======================================================= */

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  /* =======================================================
     TODAY
  ======================================================= */

  const handleTodayClick = () => {
    const currentDate = new Date();

    setCurrentMonth(getMonthStart(currentDate));

    setSelectedDate(currentDate);
  };

  /* =======================================================
     DATE CLICK
  ======================================================= */

  const handleDateClick = (date: Date) => {
    setSelectedDate(new Date(date));
  };

  /* =======================================================
     CLOSE DIALOG
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
     EVENT COUNT
  ======================================================= */

  const meetingCount = events.filter(
    (event) => event.type === "meeting",
  ).length;

  const taskCount = events.filter((event) => event.type === "task").length;

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
          sx={{ mb: 3 }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CalendarMonthRounded
                color="primary"
                sx={{
                  fontSize: 34,
                }}
              />

              <Typography variant="h4" fontWeight={800}>
                Calendar
              </Typography>
            </Stack>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              View your project meetings and tasks in one place.
            </Typography>
          </Box>

          {/* REFRESH */}

          <Tooltip title="Refresh calendar">
            <span>
              <IconButton
                onClick={() => void loadCalendar()}
                disabled={loading}
                color="primary"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <RefreshRounded />
              </IconButton>
            </span>
          </Tooltip>
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
            EVENT SUMMARY
        ================================================= */}

        {!loading && (
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1}
            sx={{
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                bgcolor: "primary.50",
                border: "1px solid",
                borderColor: "primary.100",
              }}
            >
              <EventRounded fontSize="small" color="primary" />

              <Typography variant="body2" fontWeight={700}>
                {meetingCount} {meetingCount === 1 ? "Meeting" : "Meetings"}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                bgcolor: "secondary.50",
                border: "1px solid",
                borderColor: "secondary.100",
              }}
            >
              <TaskAltRounded fontSize="small" color="secondary" />

              <Typography variant="body2" fontWeight={700}>
                {taskCount} {taskCount === 1 ? "Task" : "Tasks"}
              </Typography>
            </Box>
          </Stack>
        )}

        {/* =================================================
            CALENDAR
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
              MONTH HEADER
          ================================================= */}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "stretch",
              sm: "center",
            }}
            spacing={1.5}
            sx={{
              p: 2,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent={{
                xs: "center",
                sm: "flex-start",
              }}
              spacing={0.5}
            >
              <IconButton
                onClick={goToPreviousMonth}
                aria-label="Previous month"
              >
                <ChevronLeftRounded />
              </IconButton>

              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  minWidth: 190,
                  textAlign: "center",
                }}
              >
                {monthTitle}
              </Typography>

              <IconButton onClick={goToNextMonth} aria-label="Next month">
                <ChevronRightRounded />
              </IconButton>
            </Stack>

            <Button
              variant="outlined"
              onClick={handleTodayClick}
              startIcon={<CalendarMonthRounded />}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Today
            </Button>
          </Stack>

          <Divider />

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <Box
              sx={{
                minHeight: 650,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stack alignItems="center" spacing={2}>
                <CircularProgress />

                <Typography color="text.secondary">
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
              <Box
                sx={{
                  minWidth: 850,
                }}
              >
                {/* =================================================
                    WEEK DAYS
                ================================================= */}

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  }}
                >
                  {WEEK_DAYS.map((day) => (
                    <Box
                      key={day}
                      sx={{
                        p: 1.5,
                        textAlign: "center",
                        bgcolor: "action.hover",
                        borderRight: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        color="text.secondary"
                      >
                        {day}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* =================================================
                    CALENDAR DAYS
                ================================================= */}

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  }}
                >
                  {calendarDays.map((date) => {
                    const dateKey = getDateKey(date);

                    const dayEvents = eventsByDate.get(dateKey) ?? [];

                    const isCurrentMonth =
                      date.getMonth() === currentMonth.getMonth() &&
                      date.getFullYear() === currentMonth.getFullYear();

                    const isToday = dateKey === todayKey;

                    return (
                      <Box
                        key={`${dateKey}-${date.getTime()}`}
                        onClick={() => handleDateClick(date)}
                        sx={{
                          minHeight: 135,
                          p: 1,
                          borderTop: "1px solid",
                          borderRight: "1px solid",
                          borderColor: "divider",
                          bgcolor: isCurrentMonth
                            ? "background.paper"
                            : "action.hover",
                          cursor: "pointer",
                          transition: "background-color 0.15s ease",
                          "&:hover": {
                            bgcolor: "action.selected",
                          },
                          ...(isToday && {
                            boxShadow: "inset 0 0 0 2px",
                            borderColor: "primary.main",
                          }),
                        }}
                      >
                        {/* DATE */}

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            mb: 0.75,
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={isToday ? 800 : 600}
                            sx={{
                              width: 28,
                              height: 28,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "50%",
                              bgcolor: isToday ? "primary.main" : "transparent",
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

                        {/* EVENTS */}

                        <Stack spacing={0.5}>
                          {dayEvents.slice(0, 3).map((event) => {
                            const startTime = formatTime(event.startTime);

                            const isMeeting = event.type === "meeting";

                            return (
                              <Box
                                key={`${event.type}-${event.id}`}
                                sx={{
                                  px: 0.8,
                                  py: 0.6,
                                  borderRadius: 1.25,
                                  bgcolor: isMeeting
                                    ? "primary.main"
                                    : "secondary.main",
                                  color: isMeeting
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
                                    {startTime} {event.title}
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
                              }}
                            >
                              +{dayEvents.length - 3} more
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
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
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <EventRounded
              sx={{
                fontSize: 18,
              }}
              color="primary"
            />

            <Typography variant="caption" color="text.secondary">
              Meetings
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.75}>
            <TaskAltRounded
              sx={{
                fontSize: 18,
              }}
              color="secondary"
            />

            <Typography variant="caption" color="text.secondary">
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
          Calendar is view-only. Click any date to view its meetings and tasks.
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
          DATE DIALOG
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
        {/* HEADER */}

        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarMonthRounded color="primary" />

            <Box>
              <Typography variant="h6" fontWeight={800}>
                {isSelectedDateToday ? "Today's Schedule" : "Schedule"}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {selectedDateTitle}
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={closeDateDialog} aria-label="Close">
            <CloseRounded />
          </IconButton>
        </DialogTitle>

        <Divider />

        {/* CONTENT */}

        <DialogContent
          sx={{
            py: 2.5,
          }}
        >
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

              <Typography variant="h6" fontWeight={700}>
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
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 0.5,
                }}
              >
                You have <strong>{selectedDateEvents.length}</strong> scheduled{" "}
                {selectedDateEvents.length === 1 ? "event" : "events"} on this
                date.
              </Typography>

              {selectedDateEvents.map((event) => {
                const startTime = formatTime(event.startTime);

                const endTime = formatTime(event.endTime);

                const isMeeting = event.type === "meeting";

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
                      {/* ICON */}

                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          minWidth: 42,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 2,
                          bgcolor: isMeeting
                            ? "primary.main"
                            : "secondary.main",
                          color: isMeeting
                            ? "primary.contrastText"
                            : "secondary.contrastText",
                        }}
                      >
                        {isMeeting ? <EventRounded /> : <TaskAltRounded />}
                      </Box>

                      {/* INFORMATION */}

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
                          <Typography variant="subtitle1" fontWeight={800}>
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
                            {isMeeting ? "Meeting" : "Task"}
                          </Typography>
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.25,
                          }}
                        >
                          Project: {event.projectName}
                        </Typography>

                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            mt: 0.75,
                          }}
                        >
                          {startTime}

                          {endTime ? ` - ${endTime}` : ""}
                        </Typography>

                        {/* TASK STATUS */}

                        {!isMeeting && event.status && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.5,
                            }}
                          >
                            Status: <strong>{event.status}</strong>
                          </Typography>
                        )}

                        {/* TASK PRIORITY */}

                        {!isMeeting && event.priority && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.5,
                            }}
                          >
                            Priority: <strong>{event.priority}</strong>
                          </Typography>
                        )}

                        {/* DESCRIPTION */}

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

                        {/* MEETING LINK */}

                        {isMeeting && event.meetingLink && (
                          <Button
                            component="a"
                            href={event.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            variant="outlined"
                            sx={{
                              mt: 1,
                              textTransform: "none",
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

        {/* FOOTER */}

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
