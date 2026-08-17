import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  Add,
  Delete,
  Edit,
  OpenInNew,
  PersonAdd,
  Refresh,
  Save,
  Close,
  ArrowBack,
} from "@mui/icons-material";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import MeetingNotes from "../../components/meeting/MeetingNotes";
import AISummaryCard from "../../components/meeting/AISummaryCard";
import ActionItemsCard from "../../components/meeting/ActionItemsCard";
import AIResponseCard from "../../components/ai/AIResponseCard";
import AILoading from "../../components/ai/AILoading";

import meetingService from "../../services/meeting.service";
import aiService from "../../services/ai.service";

import type {
  Meeting,
  MeetingNote,
  UpdateMeetingData,
} from "../../types/meeting.types";

import type {
  AIOutput,
} from "../../types/ai.types";


// ============================================================
// HELPERS
// ============================================================

const getParticipantId = (
  participant: any,
): string => {
  if (!participant) {
    return "";
  }

  if (typeof participant === "string") {
    return participant;
  }

  return (
    participant._id ||
    participant.id ||
    ""
  );
};


const getParticipantName = (
  participant: any,
): string => {
  if (!participant) {
    return "Unknown participant";
  }

  if (typeof participant === "string") {
    return participant;
  }

  const fullName = [
    participant.firstName,
    participant.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    fullName ||
    participant.name ||
    participant.email ||
    participant._id ||
    "Unknown participant"
  );
};


// ============================================================
// COMPONENT
// ============================================================

const MeetingDetailsPage = () => {
  const {
    id,
  } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();


  // ==========================================================
  // MEETING STATE
  // ==========================================================

  const [
    meeting,
    setMeeting,
  ] = useState<Meeting | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  // ==========================================================
  // GENERAL ERROR
  // ==========================================================

  const [
    error,
    setError,
  ] = useState("");


  // ==========================================================
  // EDIT MEETING STATE
  // ==========================================================

  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

  const [
    editTitle,
    setEditTitle,
  ] = useState("");

  const [
    editDescription,
    setEditDescription,
  ] = useState("");

  const [
    editStartTime,
    setEditStartTime,
  ] = useState("");

  const [
    editEndTime,
    setEditEndTime,
  ] = useState("");

  const [
    editMeetingLink,
    setEditMeetingLink,
  ] = useState("");

  const [
    editParticipants,
    setEditParticipants,
  ] = useState<string[]>([]);

  const [
    newParticipantId,
    setNewParticipantId,
  ] = useState("");

  const [
    savingMeeting,
    setSavingMeeting,
  ] = useState(false);

  const [
    editError,
    setEditError,
  ] = useState("");


  // ==========================================================
  // AI STATE
  // ==========================================================

  const [
    summaryLoading,
    setSummaryLoading,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    aiHistoryLoading,
    setAIHistoryLoading,
  ] = useState(false);

  const [
    aiHistory,
    setAIHistory,
  ] = useState<AIOutput[]>([]);

  const [
    summaryError,
    setSummaryError,
  ] = useState("");

  const [
    actionError,
    setActionError,
  ] = useState("");


  // ==========================================================
  // ERROR EXTRACTION
  // ==========================================================

  const getErrorMessage = (
    err: any,
    fallback: string,
  ): string => {
    const responseData =
      err?.response?.data;

    if (
      typeof responseData?.message ===
      "string"
    ) {
      return responseData.message;
    }

    if (
      typeof responseData?.error ===
      "string"
    ) {
      return responseData.error;
    }

    if (
      typeof responseData?.error?.message ===
      "string"
    ) {
      return responseData.error.message;
    }

    if (
      typeof responseData?.error?.error?.message ===
      "string"
    ) {
      return responseData.error.error.message;
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
  // LOAD MEETING
  // ==========================================================

  const loadMeeting =
    useCallback(async () => {
      if (!id) {
        setError(
          "Meeting ID is missing.",
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);

        setError("");

        const response =
          await meetingService.getMeetingById(
            id,
          );

        if (!response?.success) {
          setError(
            response?.message ||
              "Unable to load meeting.",
          );

          return;
        }

        setMeeting(
          response.data,
        );
      } catch (err: any) {
        console.error(
          "Failed to load meeting:",
          err,
        );

        setError(
          getErrorMessage(
            err,
            "Unable to load meeting.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }, [id]);


  // ==========================================================
  // LOAD AI HISTORY
  // ==========================================================

  const loadAIHistory =
    useCallback(async () => {
      if (!id) {
        return;
      }

      try {
        setAIHistoryLoading(true);

        const response =
          await aiService.getMeetingAIOutputs(
            id,
          );

        const history =
          Array.isArray(
            response.data?.data,
          )
            ? response.data.data
            : [];

        setAIHistory(
          history,
        );
      } catch (err: any) {
        console.error(
          "Failed to load meeting AI history:",
          err,
        );

        setAIHistory([]);
      } finally {
        setAIHistoryLoading(false);
      }
    }, [id]);


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadMeeting();
    void loadAIHistory();
  }, [
    loadMeeting,
    loadAIHistory,
  ]);


  // ==========================================================
  // LATEST NOTE
  // ==========================================================

  const latestNote =
    useMemo<MeetingNote | undefined>(
      () => {
        const notes =
          meeting?.notes || [];

        if (
          notes.length === 0
        ) {
          return undefined;
        }

        return notes[
          notes.length - 1
        ];
      },
      [meeting],
    );


  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary =
    useMemo(() => {
      const notes =
        meeting?.notes || [];

      const storedSummary =
        notes
          .map(
            (note) =>
              note.aiGeneratedSummary,
          )
          .filter(
            (
              value,
            ): value is string =>
              Boolean(
                value?.trim(),
              ),
          )
          .join("\n\n");

      if (storedSummary) {
        return storedSummary;
      }

      const latestAI =
        [...aiHistory]
          .reverse()
          .find(
            (item) =>
              item.type ===
              "MEETING_SUMMARY",
          );

      return (
        latestAI?.output ||
        ""
      );
    }, [
      meeting,
      aiHistory,
    ]);


  // ==========================================================
  // OPEN EDIT DIALOG
  // ==========================================================

  const handleOpenEdit =
    () => {
      if (!meeting) {
        return;
      }

      setEditTitle(
        meeting.title || "",
      );

      setEditDescription(
        meeting.description || "",
      );

      // --------------------------------------------------------
      // START TIME
      // --------------------------------------------------------

      if (meeting.startTime) {
        const date =
          new Date(
            meeting.startTime,
          );

        if (
          !Number.isNaN(
            date.getTime(),
          )
        ) {
          const year =
            date.getFullYear();

          const month =
            String(
              date.getMonth() + 1,
            ).padStart(
              2,
              "0",
            );

          const day =
            String(
              date.getDate(),
            ).padStart(
              2,
              "0",
            );

          const hours =
            String(
              date.getHours(),
            ).padStart(
              2,
              "0",
            );

          const minutes =
            String(
              date.getMinutes(),
            ).padStart(
              2,
              "0",
            );

          setEditStartTime(
            `${year}-${month}-${day}T${hours}:${minutes}`,
          );
        } else {
          setEditStartTime("");
        }
      } else {
        setEditStartTime("");
      }


      // --------------------------------------------------------
      // END TIME
      // --------------------------------------------------------

      if (meeting.endTime) {
        const date =
          new Date(
            meeting.endTime,
          );

        if (
          !Number.isNaN(
            date.getTime(),
          )
        ) {
          const year =
            date.getFullYear();

          const month =
            String(
              date.getMonth() + 1,
            ).padStart(
              2,
              "0",
            );

          const day =
            String(
              date.getDate(),
            ).padStart(
              2,
              "0",
            );

          const hours =
            String(
              date.getHours(),
            ).padStart(
              2,
              "0",
            );

          const minutes =
            String(
              date.getMinutes(),
            ).padStart(
              2,
              "0",
            );

          setEditEndTime(
            `${year}-${month}-${day}T${hours}:${minutes}`,
          );
        } else {
          setEditEndTime("");
        }
      } else {
        setEditEndTime("");
      }


      // --------------------------------------------------------
      // MEETING LINK
      // --------------------------------------------------------

      setEditMeetingLink(
        meeting.meetingLink ||
          "",
      );


      // --------------------------------------------------------
      // PARTICIPANTS
      // --------------------------------------------------------

      const participantIds =
        (meeting.participants || [])
          .map(
            getParticipantId,
          )
          .filter(Boolean);

      setEditParticipants(
        participantIds,
      );

      setNewParticipantId("");
      setEditError("");
      setEditOpen(true);
    };


  // ==========================================================
  // CLOSE EDIT DIALOG
  // ==========================================================

  const handleCloseEdit =
    () => {
      if (savingMeeting) {
        return;
      }

      setEditOpen(false);
      setEditError("");
      setNewParticipantId("");
    };


  // ==========================================================
  // ADD PARTICIPANT
  // ==========================================================

  const handleAddParticipant =
    () => {
      const value =
        newParticipantId.trim();

      if (!value) {
        return;
      }

      if (
        editParticipants.includes(
          value,
        )
      ) {
        setEditError(
          "This participant is already added.",
        );

        return;
      }

      setEditParticipants(
        (current) => [
          ...current,
          value,
        ],
      );

      setNewParticipantId("");
      setEditError("");
    };


  // ==========================================================
  // REMOVE PARTICIPANT
  // ==========================================================

  const handleRemoveParticipant =
    (
      participantId: string,
    ) => {
      setEditParticipants(
        (current) =>
          current.filter(
            (id) =>
              id !==
              participantId,
          ),
      );
    };


  // ==========================================================
  // SAVE MEETING
  // ==========================================================

  const handleSaveMeeting =
    async () => {
      if (!meeting) {
        return;
      }

      if (!meeting._id) {
        setEditError(
          "Meeting ID is missing.",
        );

        return;
      }

      if (!editTitle.trim()) {
        setEditError(
          "Meeting title is required.",
        );

        return;
      }

      if (!editStartTime) {
        setEditError(
          "Meeting start date and time are required.",
        );

        return;
      }

      try {
        setSavingMeeting(true);
        setEditError("");

        const updateData: UpdateMeetingData =
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


        // Add end time only if supplied.
        if (editEndTime) {
          updateData.endTime =
            new Date(
              editEndTime,
            ).toISOString();
        }


        const response =
          await meetingService.updateMeeting(
            meeting._id,
            updateData,
          );


        if (!response?.success) {
          setEditError(
            response?.message ||
              "Unable to update meeting.",
          );

          return;
        }


        // ------------------------------------------------------
        // Update local state immediately
        // ------------------------------------------------------

        setMeeting(
          response.data,
        );

        setEditOpen(false);

      } catch (err: any) {
        console.error(
          "Failed to update meeting:",
          err,
        );

        setEditError(
          getErrorMessage(
            err,
            "Unable to update meeting.",
          ),
        );
      } finally {
        setSavingMeeting(false);
      }
    };


  // ==========================================================
  // GENERATE SUMMARY
  // ==========================================================

  const handleSummary =
    async () => {
      if (!id) {
        setSummaryError(
          "Meeting ID is missing.",
        );

        return;
      }

      if (!latestNote) {
        setSummaryError(
          "No meeting note is available to summarize.",
        );

        return;
      }

      if (
        !latestNote.content?.trim()
      ) {
        setSummaryError(
          "The meeting note is empty.",
        );

        return;
      }

      try {
        setSummaryLoading(true);
        setSummaryError("");
        setError("");

        await aiService.summarizeMeeting(
          id,
          latestNote._id,
        );

        await loadMeeting();
        await loadAIHistory();
      } catch (err: any) {
        console.error(
          "AI meeting summary failed:",
          err,
        );

        setSummaryError(
          getErrorMessage(
            err,
            "Failed to generate AI meeting summary.",
          ),
        );
      } finally {
        setSummaryLoading(false);
      }
    };


  // ==========================================================
  // EXTRACT ACTION ITEMS
  // ==========================================================

  const handleActionItems =
    async () => {
      if (!id) {
        setActionError(
          "Meeting ID is missing.",
        );

        return;
      }

      const notes =
        meeting?.notes || [];

      const combinedNotes =
        notes
          .map(
            (note) =>
              note.content?.trim(),
          )
          .filter(Boolean)
          .join("\n\n");

      if (!combinedNotes) {
        setActionError(
          "No meeting notes are available to analyze.",
        );

        return;
      }

      try {
        setActionLoading(true);
        setActionError("");
        setError("");

        await aiService.extractActionItems(
          id,
        );

        await loadMeeting();
        await loadAIHistory();
      } catch (err: any) {
        console.error(
          "AI action-item extraction failed:",
          err,
        );

        setActionError(
          getErrorMessage(
            err,
            "Failed to extract AI action items.",
          ),
        );
      } finally {
        setActionLoading(false);
      }
    };


  // ==========================================================
  // FORMAT AI TYPE
  // ==========================================================

  const formatAIType = (
    type: AIOutput["type"],
  ) => {
    switch (type) {
      case "TASK_PRIORITY":
        return "Task Priority";

      case "MEETING_SUMMARY":
        return "Meeting Summary";

      case "ACTION_ITEMS":
        return "Action Items";

      case "INSIGHT":
        return "Project Insight";

      default:
        return "AI Result";
    }
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
            Loading meeting...
          </Typography>
        </Stack>
      </Box>
    );
  }


  // ==========================================================
  // NOT FOUND
  // ==========================================================

  if (!meeting) {
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 5,
        }}
      >
        <Alert severity="error">
          {error ||
            "Meeting not found."}
        </Alert>

        <Button
          startIcon={
            <ArrowBack />
          }
          onClick={() =>
            navigate(-1)
          }
          sx={{
            mt: 2,
            textTransform: "none",
          }}
        >
          Back
        </Button>
      </Container>
    );
  }


  // ==========================================================
  // MEETING DATE
  // ==========================================================

  const start =
    new Date(
      meeting.startTime,
    );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: {
          xs: 3,
          sm: 5,
        },
      }}
    >
      <Stack spacing={4}>

        {/* ====================================================
            BACK
        ==================================================== */}

        <Button
          startIcon={
            <ArrowBack />
          }
          onClick={() =>
            navigate(-1)
          }
          sx={{
            alignSelf:
              "flex-start",
            textTransform:
              "none",
          }}
        >
          Back to Meetings
        </Button>


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <Alert
            severity="error"
            onClose={() =>
              setError("")
            }
          >
            {error}
          </Alert>
        )}


        {/* ====================================================
            HEADER
        ==================================================== */}

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
        >
          <Box>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                fontSize: {
                  xs: "2rem",
                  sm: "2.6rem",
                  md: "3rem",
                },
              }}
            >
              {meeting.title}
            </Typography>

            {meeting.description && (
              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                }}
              >
                {meeting.description}
              </Typography>
            )}
          </Box>

          <Button
            variant="outlined"
            startIcon={
              <Edit />
            }
            onClick={
              handleOpenEdit
            }
            sx={{
              textTransform:
                "none",
              fontWeight: 700,
            }}
          >
            Edit Meeting
          </Button>
        </Stack>


        <Divider />


        {/* ====================================================
            MEETING INFORMATION
        ==================================================== */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
            borderRadius: 3,
            border: "1px solid",
            borderColor:
              "divider",
          }}
        >
          <Stack spacing={1.5}>

            <Typography>
              <strong>
                Date:
              </strong>{" "}
              {start.toLocaleDateString()}
            </Typography>

            <Typography>
              <strong>
                Time:
              </strong>{" "}
              {start.toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}

              {meeting.endTime &&
                ` - ${new Date(
                  meeting.endTime,
                ).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}`}
            </Typography>

            <Typography>
              <strong>
                Participants:
              </strong>{" "}
              {meeting.participants
                ?.length || 0}
            </Typography>

            {meeting.createdBy &&
              typeof meeting.createdBy ===
                "object" && (
                <Typography>
                  <strong>
                    Created by:
                  </strong>{" "}
                  {[
                    meeting.createdBy
                      .firstName,
                    meeting.createdBy
                      .lastName,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                    meeting.createdBy
                      .email ||
                    "Project member"}
                </Typography>
              )}

          </Stack>
        </Paper>


        {/* ====================================================
            PARTICIPANTS
        ==================================================== */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
            borderRadius: 3,
            border: "1px solid",
            borderColor:
              "divider",
          }}
        >
          <Stack spacing={2}>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <PersonAdd
                  color="primary"
                />

                <Typography
                  variant="h5"
                  fontWeight={700}
                >
                  Participants
                </Typography>
              </Stack>

              <Button
                size="small"
                variant="outlined"
                startIcon={
                  <Edit />
                }
                onClick={
                  handleOpenEdit
                }
                sx={{
                  textTransform:
                    "none",
                }}
              >
                Edit
              </Button>
            </Stack>


            {meeting.participants?.length ? (
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
              >
                {meeting.participants.map(
                  (
                    participant,
                    index,
                  ) => (
                    <Chip
                      key={
                        getParticipantId(
                          participant,
                        ) ||
                        `participant-${index}`
                      }
                      label={
                        getParticipantName(
                          participant,
                        )
                      }
                    />
                  ),
                )}
              </Stack>
            ) : (
              <Typography
                color="text.secondary"
              >
                No participants have
                been added to this
                meeting yet.
              </Typography>
            )}

          </Stack>
        </Paper>


        {/* ====================================================
            JOIN MEETING
        ==================================================== */}

        {meeting.meetingLink ? (
          <Button
            variant="contained"
            startIcon={
              <OpenInNew />
            }
            component="a"
            href={
              meeting.meetingLink
            }
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              alignSelf:
                "flex-start",
              textTransform:
                "none",
              fontWeight: 700,
            }}
          >
            Join Meeting
          </Button>
        ) : (
          <Alert
            severity="info"
            sx={{
              maxWidth: 600,
            }}
          >
            This meeting does not
            have a meeting link yet.
            Edit the meeting to add
            one.
          </Alert>
        )}


        {/* ====================================================
            MEETING NOTES
        ==================================================== */}

        <MeetingNotes
          meetingId={
            meeting._id
          }
          notes={
            meeting.notes
          }
        />


        {/* ====================================================
            AI SUMMARY
        ==================================================== */}

        <AISummaryCard
          summary={summary}
          onGenerate={
            handleSummary
          }
          loading={
            summaryLoading
          }
          error={
            summaryError
          }
          onClearError={() =>
            setSummaryError("")
          }
        />


        {/* ====================================================
            ACTION ITEMS
        ==================================================== */}

        <ActionItemsCard
          actionItems={
            Array.isArray(
              meeting.actionItems,
            )
              ? meeting.actionItems
              : []
          }
          onGenerate={
            handleActionItems
          }
          loading={
            actionLoading
          }
          error={
            actionError
          }
          onClearError={() =>
            setActionError("")
          }
        />


        {/* ====================================================
            AI HISTORY
        ==================================================== */}

        <Divider />

        <Stack spacing={2}>

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
            spacing={1}
          >
            <Typography
              variant="h5"
              fontWeight={700}
            >
              AI History
            </Typography>

            <Button
              variant="outlined"
              size="small"
              startIcon={
                <Refresh />
              }
              onClick={() =>
                void loadAIHistory()
              }
              disabled={
                aiHistoryLoading
              }
              sx={{
                textTransform:
                  "none",
              }}
            >
              Refresh AI History
            </Button>
          </Stack>


          {aiHistoryLoading ? (
            <AILoading
              message="Loading stored meeting AI history..."
            />
          ) : aiHistory.length ===
            0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor:
                  "divider",
              }}
            >
              <Typography
                color="text.secondary"
              >
                No stored AI outputs
                are available for
                this meeting yet.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {aiHistory.map(
                (item) => (
                  <AIResponseCard
                    key={
                      item._id ||
                      `${item.type}-${item.createdAt}`
                    }
                    title={formatAIType(
                      item.type,
                    )}
                    response={
                      item.output
                    }
                  />
                ),
              )}
            </Stack>
          )}

        </Stack>

      </Stack>


      {/* ======================================================
          EDIT MEETING DIALOG
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
              disabled={
                savingMeeting
              }
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

            {/* ERROR */}

            {editError && (
              <Alert
                severity="error"
              >
                {editError}
              </Alert>
            )}


            {/* TITLE */}

            <TextField
              fullWidth
              label="Meeting title"
              value={editTitle}
              onChange={(event) =>
                setEditTitle(
                  event.target.value,
                )
              }
              disabled={
                savingMeeting
              }
              required
            />


            {/* DESCRIPTION */}

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
              disabled={
                savingMeeting
              }
              multiline
              minRows={3}
            />


            {/* START TIME */}

            <TextField
              fullWidth
              label="Start date and time"
              type="datetime-local"
              value={
                editStartTime
              }
              onChange={(event) =>
                setEditStartTime(
                  event.target.value,
                )
              }
              disabled={
                savingMeeting
              }
              required
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />


            {/* END TIME */}

            <TextField
              fullWidth
              label="End date and time"
              type="datetime-local"
              value={
                editEndTime
              }
              onChange={(event) =>
                setEditEndTime(
                  event.target.value,
                )
              }
              disabled={
                savingMeeting
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />


            {/* MEETING LINK */}

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
              disabled={
                savingMeeting
              }
              placeholder="https://meet.google.com/..."
            />


            {/* =================================================
                PARTICIPANTS
            ================================================= */}

            <Box>

              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{
                  mb: 1,
                }}
              >
                Participants
              </Typography>


              {/* CURRENT PARTICIPANTS */}

              {editParticipants.length >
              0 ? (
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{
                    mb: 2,
                  }}
                >
                  {editParticipants.map(
                    (
                      participantId,
                    ) => (
                      <Chip
                        key={
                          participantId
                        }
                        label={
                          participantId
                        }
                        onDelete={() =>
                          handleRemoveParticipant(
                            participantId,
                          )
                        }
                        deleteIcon={
                          <Delete />
                        }
                        disabled={
                          savingMeeting
                        }
                      />
                    ),
                  )}
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                  }}
                >
                  No participants
                  currently
                  assigned.
                </Typography>
              )}


              {/* ADD PARTICIPANT */}

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1}
              >

                <TextField
                  fullWidth
                  size="small"
                  label="Participant ID"
                  placeholder="Enter user ID"
                  value={
                    newParticipantId
                  }
                  onChange={(event) =>
                    setNewParticipantId(
                      event.target
                        .value,
                    )
                  }
                  disabled={
                    savingMeeting
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();

                      handleAddParticipant();
                    }
                  }}
                />

                <Button
                  variant="outlined"
                  startIcon={
                    <Add />
                  }
                  onClick={
                    handleAddParticipant
                  }
                  disabled={
                    savingMeeting ||
                    !newParticipantId.trim()
                  }
                  sx={{
                    textTransform:
                      "none",
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  Add
                </Button>

              </Stack>


              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 1,
                }}
              >
                Enter the user's ID.
                The participant IDs
                are sent to the
                existing backend
                `participants` field.
              </Typography>

            </Box>

          </Stack>
        </DialogContent>


        {/* ====================================================
            DIALOG ACTIONS
        ==================================================== */}

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
            disabled={
              savingMeeting
            }
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
            disabled={
              savingMeeting
            }
            startIcon={
              savingMeeting ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <Save />
              )
            }
            sx={{
              textTransform:
                "none",
              fontWeight: 700,
            }}
          >
            {savingMeeting
              ? "Saving..."
              : "Save Changes"}
          </Button>

        </DialogActions>

      </Dialog>

    </Container>
  );
};

export default MeetingDetailsPage;