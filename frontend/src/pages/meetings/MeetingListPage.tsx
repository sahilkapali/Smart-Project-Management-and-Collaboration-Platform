import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  Add,
  CalendarMonth,
  Close,
  Edit,
  OpenInNew,
  Refresh,
  VideoCall,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import meetingService from "../../services/meeting.service";
import projectService from "../../services/project.service";
import api from "../../services/api";

import ParticipantSelector from "../../components/meeting/ParticipantSelector";

import type {
  Meeting,
  UpdateMeetingData,
  UserReference,
} from "../../types/meeting.types";


// ============================================================
// HELPERS
// ============================================================

const getMeetingId = (
  meeting: Meeting,
): string => {
  return meeting._id || "";
};


const getMeetingLink = (
  meeting: Meeting,
): string => {
  return meeting.meetingLink || "";
};


const getMeetingStartTime = (
  meeting: Meeting,
): string => {
  return meeting.startTime || "";
};


const getParticipantId = (
  participant: UserReference | string,
): string => {
  if (typeof participant === "string") {
    return participant;
  }

  return participant._id;
};


const formatMeetingDate = (
  meeting: Meeting,
): string => {
  const value =
    getMeetingStartTime(meeting);

  if (!value) {
    return "Date not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date not available";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
};


const formatMeetingTime = (
  meeting: Meeting,
): string => {
  const value =
    getMeetingStartTime(meeting);

  if (!value) {
    return "Time not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time not available";
  }

  return date.toLocaleTimeString(
    undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
};


const isUpcomingMeeting = (
  meeting: Meeting,
): boolean => {
  const value =
    getMeetingStartTime(meeting);

  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return (
    date.getTime() >= Date.now()
  );
};


const getParticipantCount = (
  meeting: Meeting,
): number => {
  return Array.isArray(
    meeting.participants,
  )
    ? meeting.participants.length
    : 0;
};


// ============================================================
// COMPONENT
// ============================================================

const MeetingListPage = () => {
  const navigate = useNavigate();

  // ==========================================================
  // MEETINGS
  // ==========================================================

  const [meetings, setMeetings] =
    useState<Meeting[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [tab, setTab] =
    useState<0 | 1>(0);


  // ==========================================================
  // USERS
  // ==========================================================

  const [users, setUsers] =
    useState<UserReference[]>([]);

  const [loadingUsers, setLoadingUsers] =
    useState(false);


  // ==========================================================
  // EDIT STATE
  // ==========================================================

  const [editOpen, setEditOpen] =
    useState(false);

  const [editingMeeting, setEditingMeeting] =
    useState<Meeting | null>(null);

  const [editTitle, setEditTitle] =
    useState("");

  const [editDescription, setEditDescription] =
    useState("");

  const [editStartTime, setEditStartTime] =
    useState("");

  const [editMeetingLink, setEditMeetingLink] =
    useState("");

  const [editParticipants, setEditParticipants] =
    useState<string[]>([]);

  const [saving, setSaving] =
    useState(false);

  const [saveError, setSaveError] =
    useState("");


  // ==========================================================
  // ERROR MESSAGE
  // ==========================================================

  const getErrorMessage = (
    err: any,
    fallback: string,
  ): string => {
    const data =
      err?.response?.data;

    if (
      typeof data?.message ===
      "string"
    ) {
      return data.message;
    }

    if (
      typeof data?.error ===
      "string"
    ) {
      return data.error;
    }

    if (
      typeof data?.error?.message ===
      "string"
    ) {
      return data.error.message;
    }

    if (
      typeof err?.message ===
      "string"
    ) {
      return err.message;
    }

    return fallback;
  };


  // ==========================================================
  // LOAD USERS
  // ==========================================================

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);

        const response =
          await api.get("/users");

        const userData =
          response.data?.data ||
          response.data?.users ||
          [];

        if (
          Array.isArray(userData)
        ) {
          setUsers(userData);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error(
          "Failed to load users:",
          err,
        );

        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    void loadUsers();
  }, []);


  // ==========================================================
  // SELECTED EDIT USERS
  // ==========================================================

  const selectedEditUsers =
    useMemo(() => {
      return users.filter(
        (user) =>
          editParticipants.includes(
            user._id,
          ),
      );
    }, [
      users,
      editParticipants,
    ]);


  // ==========================================================
  // LOAD MEETINGS
  // ==========================================================

  const loadMeetings = async () => {
    try {
      setLoading(true);
      setError("");

      const projects =
        await projectService.getProjects();

      if (!projects.length) {
        setMeetings([]);
        return;
      }

      const validProjects =
        projects.filter(
          (
            project,
          ): project is typeof project & {
            _id: string;
          } =>
            Boolean(project._id),
        );

      const results =
        await Promise.allSettled(
          validProjects.map(
            (project) =>
              meetingService.getProjectMeetings(
                project._id,
              ),
          ),
        );

      const allMeetings: Meeting[] = [];

      let failedRequests = 0;

      results.forEach(
        (result) => {
          if (
            result.status ===
            "fulfilled"
          ) {
            const response =
              result.value;

            if (
              response.success &&
              Array.isArray(
                response.data,
              )
            ) {
              allMeetings.push(
                ...response.data,
              );
            }
          } else {
            failedRequests += 1;

            console.error(
              "Failed to load meetings:",
              result.reason,
            );
          }
        },
      );

      const uniqueMeetings =
        Array.from(
          new Map(
            allMeetings.map(
              (meeting) => [
                getMeetingId(
                  meeting,
                ),
                meeting,
              ],
            ),
          ).values(),
        );

      uniqueMeetings.sort(
        (a, b) => {
          const aTime =
            new Date(
              getMeetingStartTime(a),
            ).getTime();

          const bTime =
            new Date(
              getMeetingStartTime(b),
            ).getTime();

          return aTime - bTime;
        },
      );

      setMeetings(
        uniqueMeetings,
      );

      const successfulRequests =
        results.filter(
          (result) =>
            result.status ===
            "fulfilled",
        ).length;

      if (
        successfulRequests === 0 &&
        projects.length > 0
      ) {
        setError(
          "Unable to load meetings from your projects.",
        );
      } else if (
        failedRequests > 0
      ) {
        console.warn(
          `${failedRequests} project meeting request(s) failed.`,
        );
      }
    } catch (err: any) {
      console.error(
        "Failed to load meetings:",
        err,
      );

      setMeetings([]);

      setError(
        getErrorMessage(
          err,
          "Unable to load meetings.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadMeetings();
  }, []);


  // ==========================================================
  // UPCOMING
  // ==========================================================

  const upcomingMeetings =
    useMemo(() => {
      return meetings
        .filter(
          isUpcomingMeeting,
        )
        .sort(
          (a, b) =>
            new Date(
              getMeetingStartTime(a),
            ).getTime() -
            new Date(
              getMeetingStartTime(b),
            ).getTime(),
        );
    }, [meetings]);


  // ==========================================================
  // PAST
  // ==========================================================

  const pastMeetings =
    useMemo(() => {
      return meetings
        .filter(
          (meeting) =>
            !isUpcomingMeeting(
              meeting,
            ),
        )
        .sort(
          (a, b) =>
            new Date(
              getMeetingStartTime(b),
            ).getTime() -
            new Date(
              getMeetingStartTime(a),
            ).getTime(),
        );
    }, [meetings]);


  const displayedMeetings =
    tab === 0
      ? upcomingMeetings
      : pastMeetings;


  // ==========================================================
  // CREATE
  // ==========================================================

  const handleCreateMeeting =
    () => {
      /*
       * IMPORTANT:
       *
       * Do NOT put a project ID here.
       *
       * CreateMeetingPage loads the user's projects
       * and allows the user to select one inside
       * the create page.
       */
      navigate(
        "/meetings/create",
      );
    };


  // ==========================================================
  // OPEN
  // ==========================================================

  const handleOpenMeeting = (
    meeting: Meeting,
  ) => {
    const id =
      getMeetingId(meeting);

    if (!id) {
      return;
    }

    navigate(
      `/meetings/${id}`,
    );
  };


  // ==========================================================
  // JOIN
  // ==========================================================

  const handleJoinMeeting = (
    meeting: Meeting,
  ) => {
    /*
     * Extra protection:
     *
     * Past meetings should never be joined.
     */
    if (!isUpcomingMeeting(meeting)) {
      return;
    }

    const link =
      getMeetingLink(meeting);

    if (!link) {
      setError(
        "This meeting does not have a meeting link.",
      );

      return;
    }

    window.open(
      link,
      "_blank",
      "noopener,noreferrer",
    );
  };


  // ==========================================================
  // DATETIME LOCAL
  // ==========================================================

  const toDateTimeLocal = (
    value: string,
  ): string => {
    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return "";
    }

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(2, "0");

    const day =
      String(
        date.getDate(),
      ).padStart(2, "0");

    const hours =
      String(
        date.getHours(),
      ).padStart(2, "0");

    const minutes =
      String(
        date.getMinutes(),
      ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };


  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  const handleEditMeeting = (
    meeting: Meeting,
  ) => {
    setEditingMeeting(
      meeting,
    );

    setEditTitle(
      meeting.title || "",
    );

    setEditDescription(
      meeting.description || "",
    );

    setEditStartTime(
      toDateTimeLocal(
        meeting.startTime,
      ),
    );

    setEditMeetingLink(
      meeting.meetingLink || "",
    );

    setEditParticipants(
      Array.isArray(
        meeting.participants,
      )
        ? meeting.participants.map(
            getParticipantId,
          )
        : [],
    );

    setSaveError("");
    setEditOpen(true);
  };


  // ==========================================================
  // CLOSE EDIT
  // ==========================================================

  const handleCloseEdit = () => {
    if (saving) {
      return;
    }

    setEditOpen(false);
    setEditingMeeting(null);
    setSaveError("");
    setEditParticipants([]);
  };


  // ==========================================================
  // SAVE EDIT
  // ==========================================================

  const handleSaveMeeting =
    async () => {
      if (!editingMeeting) {
        return;
      }

      const meetingId =
        getMeetingId(
          editingMeeting,
        );

      if (!meetingId) {
        setSaveError(
          "Meeting ID is missing.",
        );

        return;
      }

      if (!editTitle.trim()) {
        setSaveError(
          "Meeting title is required.",
        );

        return;
      }

      if (!editStartTime) {
        setSaveError(
          "Meeting date and time are required.",
        );

        return;
      }

      try {
        setSaving(true);
        setSaveError("");

        const updateData:
          UpdateMeetingData =
          {
            title:
              editTitle.trim(),

            description:
              editDescription.trim(),

            meetingLink:
              editMeetingLink.trim(),

            startTime:
              new Date(
                editStartTime,
              ).toISOString(),

            participants:
              editParticipants,
          };

        const response =
          await meetingService.updateMeeting(
            meetingId,
            updateData,
          );

        if (
          !response.success
        ) {
          setSaveError(
            response.message ||
              "Unable to update meeting.",
          );

          return;
        }

        const updatedMeeting =
          response.data;

        setMeetings(
          (current) =>
            current.map(
              (meeting) =>
                getMeetingId(
                  meeting,
                ) === meetingId
                  ? updatedMeeting
                  : meeting,
            ),
        );

        setEditOpen(false);
        setEditingMeeting(null);
        setEditParticipants([]);
      } catch (err: any) {
        console.error(
          "Failed to update meeting:",
          err,
        );

        setSaveError(
          getErrorMessage(
            err,
            "Unable to update meeting.",
          ),
        );
      } finally {
        setSaving(false);
      }
    };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 8,
          display: "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress />

          <Typography
            color="text.secondary"
          >
            Loading meetings...
          </Typography>
        </Stack>
      </Container>
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: {
          xs: 3,
          md: 5,
        },
      }}
    >
      <Stack spacing={3}>

        {/* HEADER */}

        <Paper
          elevation={0}
          sx={{
            border:
              "1px solid",
            borderColor:
              "divider",
            borderRadius: 4,
            p: {
              xs: 2.5,
              sm: 3,
              md: 4,
            },
          }}
        >
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
            spacing={2}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  fontSize: {
                    xs: "2rem",
                    md: "2.5rem",
                  },
                }}
              >
                Meetings
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  fontSize:
                    "1.1rem",
                }}
              >
                Schedule and manage
                your meetings
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={
                handleCreateMeeting
              }
              sx={{
                borderRadius: 2,
                px: 2.5,
                py: 1.25,
                fontWeight: 700,
                textTransform:
                  "none",
                alignSelf: {
                  xs: "flex-start",
                  sm: "auto",
                },
              }}
            >
              Schedule Meeting
            </Button>
          </Stack>

          <Tabs
            value={tab}
            onChange={(
              _event,
              value,
            ) =>
              setTab(value)
            }
            sx={{
              mt: 4,
              borderBottom:
                "1px solid",
              borderColor:
                "divider",
            }}
          >
            <Tab
              label={`Upcoming Meetings (${upcomingMeetings.length})`}
              sx={{
                textTransform:
                  "none",
                fontWeight: 700,
                fontSize:
                  "1rem",
              }}
            />

            <Tab
              label={`Past Meetings (${pastMeetings.length})`}
              sx={{
                textTransform:
                  "none",
                fontWeight: 700,
                fontSize:
                  "1rem",
              }}
            />
          </Tabs>
        </Paper>


        {/* ERROR */}

        {error && (
          <Alert
            severity="error"
            onClose={() =>
              setError("")
            }
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() =>
                  void loadMeetings()
                }
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}


        {/* MEETING LIST */}

        <Paper
          elevation={0}
          sx={{
            border:
              "1px solid",
            borderColor:
              "divider",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {displayedMeetings.length ===
          0 ? (
            <Box
              sx={{
                py: 8,
                px: 3,
                textAlign:
                  "center",
              }}
            >
              <CalendarMonth
                sx={{
                  fontSize: 56,
                  color:
                    "text.secondary",
                  mb: 2,
                }}
              />

              <Typography
                variant="h6"
                fontWeight={700}
              >
                {tab === 0
                  ? "No upcoming meetings"
                  : "No past meetings"}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                }}
              >
                {tab === 0
                  ? "Schedule a meeting to see it here."
                  : "Completed meetings will appear here."}
              </Typography>
            </Box>
          ) : (
            displayedMeetings.map(
              (
                meeting,
                index,
              ) => {
                const meetingId =
                  getMeetingId(
                    meeting,
                  );

                const link =
                  getMeetingLink(
                    meeting,
                  );

                const participantCount =
                  getParticipantCount(
                    meeting,
                  );

                const upcoming =
                  isUpcomingMeeting(
                    meeting,
                  );

                return (
                  <Box
                    key={
                      meetingId ||
                      `meeting-${index}`
                    }
                    sx={{
                      borderBottom:
                        index ===
                        displayedMeetings.length -
                          1
                          ? "none"
                          : "1px solid",
                      borderColor:
                        "divider",
                      px: {
                        xs: 2,
                        sm: 3,
                      },
                      py: 2.5,
                    }}
                  >
                    <Stack
                      direction={{
                        xs: "column",
                        md: "row",
                      }}
                      spacing={2.5}
                      alignItems={{
                        xs: "stretch",
                        md: "center",
                      }}
                    >

                      {/* ICON */}

                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          minWidth: 56,
                          borderRadius: 2,
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          bgcolor:
                            "primary.light",
                          color:
                            "primary.main",
                        }}
                      >
                        <VideoCall
                          fontSize="large"
                        />
                      </Box>


                      {/* TITLE */}

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={800}
                          sx={{
                            cursor:
                              "pointer",
                            "&:hover":
                              {
                                color:
                                  "primary.main",
                              },
                          }}
                          onClick={() =>
                            handleOpenMeeting(
                              meeting,
                            )
                          }
                        >
                          {meeting.title ||
                            "Untitled Meeting"}
                        </Typography>

                        <Typography
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                          }}
                        >
                          {formatMeetingDate(
                            meeting,
                          )}
                          {", "}
                          {formatMeetingTime(
                            meeting,
                          )}
                        </Typography>

                        {meeting.description && (
                          <Typography
                            color="text.secondary"
                            sx={{
                              mt: 0.75,
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                              maxWidth:
                                500,
                            }}
                          >
                            {
                              meeting.description
                            }
                          </Typography>
                        )}
                      </Box>


                      {/* TYPE */}

                      <Box
                        sx={{
                          minWidth: {
                            md: 130,
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <VideoCall
                            fontSize="small"
                            color="primary"
                          />

                          <Typography
                            fontWeight={600}
                          >
                            Meeting
                          </Typography>
                        </Stack>
                      </Box>


                      {/* MEMBERS */}

                      <Box
                        sx={{
                          minWidth: {
                            md: 110,
                          },
                        }}
                      >
                        <Typography
                          color="text.secondary"
                        >
                          {
                            participantCount
                          }{" "}
                          {participantCount ===
                          1
                            ? "Member"
                            : "Members"}
                        </Typography>
                      </Box>


                      {/* ACTIONS */}

                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >

                        {/* JOIN */}

                        <Tooltip
                          title={
                            upcoming
                              ? link
                                ? "Join meeting"
                                : "Meeting link unavailable"
                              : "Past meetings cannot be joined"
                          }
                        >
                          <span>
                            <Button
                              variant={
                                link &&
                                upcoming
                                  ? "contained"
                                  : "outlined"
                              }
                              disabled={
                                !link ||
                                !upcoming
                              }
                              startIcon={
                                <OpenInNew />
                              }
                              onClick={() =>
                                handleJoinMeeting(
                                  meeting,
                                )
                              }
                              sx={{
                                minWidth:
                                  90,
                                textTransform:
                                  "none",
                                fontWeight:
                                  700,
                                borderRadius:
                                  2,
                              }}
                            >
                              Join
                            </Button>
                          </span>
                        </Tooltip>


                        {/* EDIT */}

                        <Tooltip
                          title="Edit meeting"
                        >
                          <IconButton
                            onClick={() =>
                              handleEditMeeting(
                                meeting,
                              )
                            }
                            sx={{
                              border:
                                "1px solid",
                              borderColor:
                                "divider",
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>

                      </Stack>
                    </Stack>
                  </Box>
                );
              },
            )
          )}
        </Paper>


        {/* REFRESH */}

        <Box
          sx={{
            display: "flex",
            justifyContent:
              "flex-end",
          }}
        >
          <Button
            startIcon={
              <Refresh />
            }
            onClick={() =>
              void loadMeetings()
            }
            sx={{
              textTransform:
                "none",
            }}
          >
            Refresh meetings
          </Button>
        </Box>
      </Stack>


      {/* ======================================================
          EDIT DIALOG
      ====================================================== */}

      <Dialog
        open={editOpen}
        onClose={
          handleCloseEdit
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="h6"
              fontWeight={800}
            >
              Edit Meeting
            </Typography>

            <IconButton
              onClick={
                handleCloseEdit
              }
              disabled={saving}
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2.5}
            sx={{
              pt: 1,
            }}
          >

            {saveError && (
              <Alert severity="error">
                {saveError}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Meeting title"
              value={editTitle}
              onChange={(event) =>
                setEditTitle(
                  event.target.value,
                )
              }
              disabled={saving}
              required
            />

            <TextField
              fullWidth
              label="Description"
              value={
                editDescription
              }
              onChange={(event) =>
                setEditDescription(
                  event.target.value,
                )
              }
              disabled={saving}
              multiline
              minRows={3}
            />

            <TextField
              fullWidth
              label="Date and time"
              type="datetime-local"
              value={
                editStartTime
              }
              onChange={(event) =>
                setEditStartTime(
                  event.target.value,
                )
              }
              disabled={saving}
              required
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <TextField
              fullWidth
              label="Meeting link"
              value={
                editMeetingLink
              }
              onChange={(event) =>
                setEditMeetingLink(
                  event.target.value,
                )
              }
              disabled={saving}
              placeholder="https://meet.google.com/..."
            />

            {/* PARTICIPANTS */}

            <ParticipantSelector
              users={users}
              selectedParticipants={
                selectedEditUsers
              }
              onChange={(
                selected,
              ) => {
                setEditParticipants(
                  selected.map(
                    (user) =>
                      user._id,
                  ),
                );
              }}
              disabled={
                saving ||
                loadingUsers
              }
              loading={
                loadingUsers
              }
            />

          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button
            onClick={
              handleCloseEdit
            }
            disabled={saving}
            sx={{
              textTransform:
                "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              void handleSaveMeeting()
            }
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <Edit />
              )
            }
            sx={{
              textTransform:
                "none",
              fontWeight: 700,
            }}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MeetingListPage;