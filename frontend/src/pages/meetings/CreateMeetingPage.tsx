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
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  Groups,
  Save,
  VideoCall,
} from "@mui/icons-material";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import meetingService from "../../services/meeting.service";
import projectService from "../../services/project.service";
import api from "../../services/api";

import ParticipantSelector from "../../components/meeting/ParticipantSelector";

import type {
  UserReference,
} from "../../types/meeting.types";


// ============================================================
// TYPES
// ============================================================

/*
 * IMPORTANT:
 *
 * Do not create a ProjectReference type here.
 *
 * We use the exact type returned by projectService.getProjects().
 * This prevents the TypeScript error:
 *
 * "A type predicate's type must be assignable..."
 */
type ProjectList =
  Awaited<
    ReturnType<
      typeof projectService.getProjects
    >
  >;


// ============================================================
// HELPERS
// ============================================================

const getProjectName = (
  project: ProjectList[number],
): string => {
  return (
    project.name ||
    "Untitled Project"
  );
};


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
    Array.isArray(data?.errors) &&
    data.errors.length > 0
  ) {
    return data.errors.join(", ");
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


// ============================================================
// COMPONENT
// ============================================================

const CreateMeetingPage = () => {
  const navigate = useNavigate();

  /*
   * Supports both:
   *
   * /meetings/create
   *
   * and:
   *
   * /projects/:projectId/meetings/create
   *
   * Normally the user will use /meetings/create.
   */
  const {
    projectId: routeProjectId,
  } = useParams<{
    projectId?: string;
  }>();


  // ==========================================================
  // PROJECTS
  // ==========================================================

  const [projects, setProjects] =
    useState<ProjectList>([]);

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState(
    routeProjectId || "",
  );

  const [
    loadingProjects,
    setLoadingProjects,
  ] = useState(true);


  // ==========================================================
  // USERS
  // ==========================================================

  const [users, setUsers] =
    useState<UserReference[]>([]);

  const [
    selectedParticipants,
    setSelectedParticipants,
  ] = useState<UserReference[]>([]);

  const [
    loadingUsers,
    setLoadingUsers,
  ] = useState(true);


  // ==========================================================
  // FORM
  // ==========================================================

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [meetingLink, setMeetingLink] =
    useState("");


  // ==========================================================
  // STATE
  // ==========================================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==========================================================
  // LOAD PROJECTS
  // ==========================================================

  useEffect(() => {
    const loadProjects =
      async () => {
        try {
          setLoadingProjects(true);
          setError("");

          const data =
            await projectService.getProjects();

          /*
           * getProjects() already returns
           * the correct Project[] type.
           *
           * Do not use a type predicate here.
           */
          if (Array.isArray(data)) {
            setProjects(data);

            /*
             * If the page was opened through:
             *
             * /projects/:projectId/meetings/create
             *
             * automatically select that project.
             */
            if (
              routeProjectId &&
              data.some(
                (project) =>
                  project._id ===
                  routeProjectId,
              )
            ) {
              setSelectedProjectId(
                routeProjectId,
              );
            }
          } else {
            setProjects([]);
          }
        } catch (err: any) {
          console.error(
            "Failed to load projects:",
            err,
          );

          setProjects([]);

          setError(
            getErrorMessage(
              err,
              "Unable to load projects.",
            ),
          );
        } finally {
          setLoadingProjects(false);
        }
      };

    void loadProjects();
  }, [routeProjectId]);


  // ==========================================================
  // LOAD USERS
  // ==========================================================

  useEffect(() => {
    const loadUsers =
      async () => {
        try {
          setLoadingUsers(true);

          const response =
            await api.get("/users");

          const userData =
            response.data?.data ||
            response.data?.users ||
            [];

          if (
            Array.isArray(
              userData,
            )
          ) {
            setUsers(
              userData,
            );
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
  // SELECTED PARTICIPANT IDS
  // ==========================================================

  const participantIds =
    useMemo(() => {
      return selectedParticipants
        .map(
          (user) =>
            user._id,
        )
        .filter(Boolean);
    }, [
      selectedParticipants,
    ]);


  // ==========================================================
  // DEFAULT END TIME
  // ==========================================================

  const handleStartTimeChange = (
    value: string,
  ) => {
    setStartTime(value);

    /*
     * Automatically set end time
     * to one hour after start time.
     */
    if (!value) {
      setEndTime("");
      return;
    }

    const start =
      new Date(value);

    if (
      Number.isNaN(
        start.getTime(),
      )
    ) {
      return;
    }

    const end =
      new Date(
        start.getTime() +
          60 * 60 * 1000,
      );

    const year =
      end.getFullYear();

    const month =
      String(
        end.getMonth() + 1,
      ).padStart(2, "0");

    const day =
      String(
        end.getDate(),
      ).padStart(2, "0");

    const hours =
      String(
        end.getHours(),
      ).padStart(2, "0");

    const minutes =
      String(
        end.getMinutes(),
      ).padStart(2, "0");

    setEndTime(
      `${year}-${month}-${day}T${hours}:${minutes}`,
    );
  };


  // ==========================================================
  // CREATE MEETING
  // ==========================================================

  const handleCreateMeeting =
    async () => {
      setError("");
      setSuccess("");

      // ------------------------------------------------------
      // PROJECT
      // ------------------------------------------------------

      if (!selectedProjectId) {
        setError(
          "Please select a project.",
        );

        return;
      }


      // ------------------------------------------------------
      // TITLE
      // ------------------------------------------------------

      if (!title.trim()) {
        setError(
          "Meeting title is required.",
        );

        return;
      }

      if (
        title.trim().length < 3
      ) {
        setError(
          "Meeting title must contain at least 3 characters.",
        );

        return;
      }


      // ------------------------------------------------------
      // START TIME
      // ------------------------------------------------------

      if (!startTime) {
        setError(
          "Meeting date and time are required.",
        );

        return;
      }


      // ------------------------------------------------------
      // END TIME
      // ------------------------------------------------------

      if (!endTime) {
        setError(
          "Meeting end time is required.",
        );

        return;
      }

      const start =
        new Date(startTime);

      const end =
        new Date(endTime);

      if (
        Number.isNaN(
          start.getTime(),
        )
      ) {
        setError(
          "Please enter a valid start date and time.",
        );

        return;
      }

      if (
        Number.isNaN(
          end.getTime(),
        )
      ) {
        setError(
          "Please enter a valid end date and time.",
        );

        return;
      }

      if (
        start >= end
      ) {
        setError(
          "Meeting end time must be later than the start time.",
        );

        return;
      }


      // ------------------------------------------------------
      // MEETING LINK
      // ------------------------------------------------------

      if (
        meetingLink.trim()
      ) {
        try {
          new URL(
            meetingLink.trim(),
          );
        } catch {
          setError(
            "Please enter a valid meeting link URL.",
          );

          return;
        }
      }


      // ------------------------------------------------------
      // SAVE
      // ------------------------------------------------------

      try {
        setLoading(true);

        /*
         * IMPORTANT:
         *
         * The project ID comes from the
         * project dropdown inside this page.
         */
        const meetingData = {
          title:
            title.trim(),

          description:
            description.trim(),

          meetingLink:
            meetingLink.trim(),

          projectId:
            selectedProjectId,

          participants:
            participantIds,

          startTime:
            start.toISOString(),

          endTime:
            end.toISOString(),
        };

        console.log(
          "Creating meeting:",
          meetingData,
        );

        const response =
          await meetingService.createMeeting(
            meetingData,
          );

        if (
          !response?.success
        ) {
          setError(
            response?.message ||
              "Unable to schedule meeting.",
          );

          return;
        }

        setSuccess(
          "Meeting scheduled successfully.",
        );

        /*
         * Return to the global meetings page.
         */
        setTimeout(() => {
          navigate(
            "/meetings",
          );
        }, 700);
      } catch (err: any) {
        console.error(
          "Failed to create meeting:",
          err,
        );

        setError(
          getErrorMessage(
            err,
            "Unable to schedule meeting.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };


  // ==========================================================
  // LOADING PROJECTS
  // ==========================================================

  if (loadingProjects) {
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 8,
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
            Loading projects...
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
      maxWidth="md"
      sx={{
        py: {
          xs: 3,
          md: 5,
        },
      }}
    >
      <Stack spacing={3}>

        {/* ==================================================
            BACK
        ================================================== */}

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
          Back
        </Button>


        {/* ==================================================
            HEADER
        ================================================== */}

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
              sm: 4,
            },
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <Box
              sx={{
                width: 56,
                height: 56,
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

            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
              >
                Schedule Meeting
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                Create a meeting for
                one of your projects
              </Typography>
            </Box>
          </Stack>
        </Paper>


        {/* ==================================================
            ERROR
        ================================================== */}

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


        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <Alert severity="success">
            {success}
          </Alert>
        )}


        {/* ==================================================
            FORM
        ================================================== */}

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
              sm: 4,
            },
          }}
        >
          <Stack spacing={3}>

            {/* =================================================
                PROJECT
            ================================================= */}

            <FormControl
              fullWidth
              required
              disabled={
                loading ||
                projects.length === 0
              }
            >
              <InputLabel>
                Project
              </InputLabel>

              <Select
                value={
                  selectedProjectId
                }
                label="Project"
                onChange={(
                  event,
                ) => {
                  setSelectedProjectId(
                    event.target.value,
                  );

                  /*
                   * Clear any previous
                   * project-related error.
                   */
                  setError("");
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 320,
                    },
                  },
                }}
              >
                {projects.map(
                  (project) => (
                    <MenuItem
                      key={
                        project._id
                      }
                      value={
                        project._id
                      }
                    >
                      {getProjectName(
                        project,
                      )}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>


            {/* =================================================
                NO PROJECTS
            ================================================= */}

            {projects.length ===
              0 && (
              <Alert severity="warning">
                You do not have any
                accessible projects.
              </Alert>
            )}


            {/* =================================================
                TITLE
            ================================================= */}

            <TextField
              fullWidth
              required
              label="Meeting title"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              disabled={loading}
            />


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <TextField
              fullWidth
              label="Description"
              value={
                description
              }
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              disabled={loading}
              multiline
              minRows={4}
            />


            {/* =================================================
                START
            ================================================= */}

            <TextField
              fullWidth
              required
              label="Date and time"
              type="datetime-local"
              value={startTime}
              onChange={(event) =>
                handleStartTimeChange(
                  event.target.value,
                )
              }
              disabled={loading}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />


            {/* =================================================
                END
            ================================================= */}

            <TextField
              fullWidth
              required
              label="End date and time"
              type="datetime-local"
              value={endTime}
              onChange={(event) =>
                setEndTime(
                  event.target.value,
                )
              }
              disabled={loading}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />


            {/* =================================================
                MEETING LINK
            ================================================= */}

            <TextField
              fullWidth
              label="Meeting link"
              value={
                meetingLink
              }
              onChange={(event) =>
                setMeetingLink(
                  event.target.value,
                )
              }
              disabled={loading}
              placeholder="https://meet.google.com/..."
            />


            {/* =================================================
                PARTICIPANTS
            ================================================= */}

            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  mb: 1,
                }}
              >
                <Groups
                  color="primary"
                />

                <Typography
                  fontWeight={700}
                >
                  Participants
                </Typography>
              </Stack>

              <ParticipantSelector
                users={users}
                selectedParticipants={
                  selectedParticipants
                }
                onChange={(
                  selected,
                ) => {
                  setSelectedParticipants(
                    selected,
                  );
                }}
                disabled={
                  loading ||
                  loadingUsers
                }
                loading={
                  loadingUsers
                }
              />
            </Box>


            {/* =================================================
                BUTTONS
            ================================================= */}

            <Stack
              direction={{
                xs: "column-reverse",
                sm: "row",
              }}
              spacing={2}
              justifyContent="flex-end"
            >
              <Button
                variant="outlined"
                startIcon={
                  <ArrowBack />
                }
                onClick={() =>
                  navigate(-1)
                }
                disabled={
                  loading
                }
                sx={{
                  textTransform:
                    "none",
                  borderRadius: 2,
                  px: 3,
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                startIcon={
                  loading ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : (
                    <Save />
                  )
                }
                onClick={() =>
                  void handleCreateMeeting()
                }
                disabled={
                  loading ||
                  loadingProjects ||
                  projects.length ===
                    0 ||
                  !selectedProjectId
                }
                sx={{
                  textTransform:
                    "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 3,
                }}
              >
                {loading
                  ? "Scheduling..."
                  : "Schedule Meeting"}
              </Button>
            </Stack>

          </Stack>
        </Paper>

      </Stack>
    </Container>
  );
};

export default CreateMeetingPage;