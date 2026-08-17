import {
  useEffect,
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
  Typography,
} from "@mui/material";

import {
  AutoAwesome,
  DescriptionOutlined,
  LightbulbOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";

import api from "../../services/api";
import aiService from "../../services/ai.service";

import type { Project } from "../../types/project.types";

const AIPage = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [projects, setProjects] = useState<Project[]>([]);

  const [selectedProjectId, setSelectedProjectId] =
    useState<string>("");

  const [answer, setAnswer] =
    useState<string>("");

  const [loadingProjects, setLoadingProjects] =
    useState<boolean>(true);

  const [loadingAI, setLoadingAI] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  // ============================================================
  // LOAD PROJECTS
  // ============================================================

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        setError("");

        const response = await api.get(
          "/projects",
        );

        const data = response.data;

        let projectList: Project[] = [];

        if (Array.isArray(data)) {
          projectList = data;
        } else if (
          Array.isArray(data?.projects)
        ) {
          projectList = data.projects;
        } else if (
          Array.isArray(data?.data)
        ) {
          projectList = data.data;
        }

        setProjects(projectList);

        // Automatically select first project
        if (projectList.length > 0) {
          const firstProject =
            projectList[0];

          const firstProjectId =
            firstProject.id ||
            firstProject._id;

          if (firstProjectId) {
            setSelectedProjectId(
              firstProjectId,
            );
          }
        }
      } catch (err: any) {
        console.error(
          "Failed to load projects:",
          err,
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load projects.",
        );
      } finally {
        setLoadingProjects(false);
      }
    };

    void loadProjects();
  }, []);

  // ============================================================
  // SELECTED PROJECT
  // ============================================================

  const selectedProject =
    projects.find(
      (project) =>
        (project.id || project._id) ===
        selectedProjectId,
    );

  // ============================================================
  // FORMAT AI RESPONSE
  // ============================================================

  const formatAIResponse = (
    value: unknown,
  ): string => {
    if (
      typeof value === "string"
    ) {
      return value;
    }

    if (
      value === null ||
      value === undefined
    ) {
      return "The AI returned an empty response.";
    }

    if (
      typeof value === "object"
    ) {
      try {
        return JSON.stringify(
          value,
          null,
          2,
        );
      } catch {
        return String(value);
      }
    }

    return String(value);
  };

  // ============================================================
  // GENERATE PROJECT SUMMARY
  // ============================================================

  const generateProjectSummary =
    async () => {
      if (!selectedProjectId) {
        setError(
          "Please select a project first.",
        );

        return;
      }

      try {
        setLoadingAI(true);
        setError("");
        setAnswer("");

        /*
         * IMPORTANT:
         *
         * This uses the existing backend endpoint:
         *
         * POST /api/ai/insight
         *
         * with:
         *
         * {
         *   projectId: selectedProjectId
         * }
         */

        const response =
          await aiService.generateProjectInsight(
            selectedProjectId,
          );

        /*
         * Do not access guessed properties such as:
         *
         * response.data.answer
         * response.data.summary
         * response.data.insight
         *
         * because those properties are not defined
         * in your AIResponse TypeScript interface.
         *
         * Instead, display the actual typed response.
         */

        setAnswer(
          formatAIResponse(
            response.data,
          ),
        );
      } catch (err: any) {
        console.error(
          "Project AI insight failed:",
          err,
        );

        const backendData =
          err?.response?.data;

        /*
         * Handle the Google authentication
         * error without changing the backend.
         */

        if (
          backendData?.error?.status ===
          "UNAUTHENTICATED"
        ) {
          setError(
            "The request reached the backend AI service, but the Google/Gemini AI authentication credentials are invalid.",
          );

          return;
        }

        if (
          backendData?.status ===
          "UNAUTHENTICATED"
        ) {
          setError(
            "The request reached the backend AI service, but the Google/Gemini AI authentication credentials are invalid.",
          );

          return;
        }

        const message =
          backendData?.message ||
          backendData?.error?.message ||
          err?.message ||
          "Unable to generate the AI project summary.";

        setError(message);
      } finally {
        setLoadingAI(false);
      }
    };

  // ============================================================
  // QUICK ACTION
  // ============================================================

  const handleQuickAction = async (
    action: string,
  ) => {
    setError("");

    if (!selectedProjectId) {
      setError(
        "Please select a project first.",
      );

      return;
    }

    /*
     * Your current backend exposes project AI
     * through /ai/insight.
     *
     * Therefore the project-level actions use
     * the selected project.
     */

    if (
      action === "summary" ||
      action === "priority" ||
      action === "risks"
    ) {
      await generateProjectSummary();

      return;
    }

    /*
     * Meeting AI requires a meetingId.
     * It should be generated from the
     * MeetingDetailsPage instead.
     */

    if (action === "meeting") {
      setError(
        "Select a specific meeting to generate AI meeting notes, summary and action items.",
      );
    }
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <Box
      sx={{
        minHeight: "100%",
        width: "100%",
        bgcolor:
          "background.default",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          py: {
            xs: 3,
            sm: 4,
            md: 5,
          },
        }}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <Box sx={{ mb: 3 }}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <AutoAwesome
              sx={{
                color: "primary.main",
                fontSize: 36,
              }}
            />

            <Typography
              sx={{
                fontSize: {
                  xs: "2rem",
                  sm: "2.5rem",
                  md: "3rem",
                },
                fontWeight: 800,
                lineHeight: 1.15,
              }}
            >
              AI Assistant
            </Typography>
          </Stack>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: {
                xs: "1rem",
                sm: "1.2rem",
              },
            }}
          >
            How can I help you today?
          </Typography>
        </Box>

        {/* ====================================================
            MAIN PANEL
        ==================================================== */}

        <Paper
          elevation={0}
          sx={{
            minHeight: {
              xs: 520,
              md: 600,
            },

            borderRadius: 4,

            border: "1px solid",

            borderColor: "divider",

            background:
              "linear-gradient(180deg, rgba(99, 72, 180, 0.07) 0%, rgba(255,255,255,0) 70%)",

            p: {
              xs: 2.5,
              sm: 4,
              md: 5,
            },

            display: "flex",

            flexDirection: "column",
          }}
        >
          {/* ==================================================
              GREETING
          ================================================== */}

          <Typography
            sx={{
              fontSize: {
                xs: "1.1rem",
                sm: "1.3rem",
              },

              fontWeight: 600,

              mb: 2.5,
            }}
          >
            Hello! I can help you with:
          </Typography>

          {/* ==================================================
              PROJECT SELECTOR
          ================================================== */}

          <Box
            sx={{
              maxWidth: 800,
              mb: 3,
            }}
          >
            <FormControl
              fullWidth
              disabled={
                loadingProjects ||
                loadingAI ||
                projects.length === 0
              }
            >
              <InputLabel>
                Select Project
              </InputLabel>

              <Select
                value={
                  selectedProjectId
                }
                label="Select Project"
                onChange={(event) => {
                  setSelectedProjectId(
                    event.target.value,
                  );

                  setAnswer("");
                  setError("");
                }}
              >
                {projects.map(
                  (project) => {
                    const projectId =
                      project.id ||
                      project._id;

                    if (!projectId) {
                      return null;
                    }

                    return (
                      <MenuItem
                        key={projectId}
                        value={projectId}
                      >
                        {project.name}
                      </MenuItem>
                    );
                  },
                )}
              </Select>
            </FormControl>

            {/* NO PROJECTS */}

            {!loadingProjects &&
              projects.length === 0 && (
                <Alert
                  severity="warning"
                  sx={{ mt: 2 }}
                >
                  No projects are
                  available. Create a
                  project before using
                  project AI features.
                </Alert>
              )}
          </Box>

          {/* ==================================================
              SELECTED PROJECT
          ================================================== */}

          {selectedProject && (
            <Paper
              elevation={0}
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor:
                  "divider",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                AI is working with
                project
              </Typography>

              <Typography
                fontWeight={700}
                sx={{ mt: 0.5 }}
              >
                {selectedProject.name}
              </Typography>
            </Paper>
          )}

          {/* ==================================================
              QUICK ACTIONS
          ================================================== */}

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },

              gap: 2,

              maxWidth: 800,
            }}
          >
            {/* PROJECT SUMMARY */}

            <Button
              variant="outlined"
              startIcon={
                <DescriptionOutlined />
              }
              disabled={
                loadingAI ||
                !selectedProjectId
              }
              onClick={() =>
                void handleQuickAction(
                  "summary",
                )
              }
              sx={{
                justifyContent:
                  "flex-start",

                textAlign: "left",

                minHeight: 64,

                px: 2,

                borderRadius: 2,

                textTransform:
                  "none",

                fontSize: "1rem",

                fontWeight: 600,
              }}
            >
              Summarize project status
            </Button>

            {/* TASK PRIORITIES */}

            <Button
              variant="outlined"
              startIcon={
                <LightbulbOutlined />
              }
              disabled={
                loadingAI ||
                !selectedProjectId
              }
              onClick={() =>
                void handleQuickAction(
                  "priority",
                )
              }
              sx={{
                justifyContent:
                  "flex-start",

                textAlign: "left",

                minHeight: 64,

                px: 2,

                borderRadius: 2,

                textTransform:
                  "none",

                fontSize: "1rem",

                fontWeight: 600,
              }}
            >
              Suggest task priorities
            </Button>

            {/* MEETING NOTES */}

            <Button
              variant="outlined"
              startIcon={
                <DescriptionOutlined />
              }
              disabled={loadingAI}
              onClick={() =>
                void handleQuickAction(
                  "meeting",
                )
              }
              sx={{
                justifyContent:
                  "flex-start",

                textAlign: "left",

                minHeight: 64,

                px: 2,

                borderRadius: 2,

                textTransform:
                  "none",

                fontSize: "1rem",

                fontWeight: 600,
              }}
            >
              Generate meeting notes
            </Button>

            {/* PROJECT RISKS */}

            <Button
              variant="outlined"
              startIcon={
                <TrendingUpOutlined />
              }
              disabled={
                loadingAI ||
                !selectedProjectId
              }
              onClick={() =>
                void handleQuickAction(
                  "risks",
                )
              }
              sx={{
                justifyContent:
                  "flex-start",

                textAlign: "left",

                minHeight: 64,

                px: 2,

                borderRadius: 2,

                textTransform:
                  "none",

                fontSize: "1rem",

                fontWeight: 600,
              }}
            >
              Analyze project risks
            </Button>
          </Box>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <Alert
              severity="error"
              sx={{
                mt: 3,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          {/* ==================================================
              LOADING
          ================================================== */}

          {loadingAI && (
            <Box
              sx={{
                mt: 4,

                display: "flex",

                alignItems:
                  "center",

                gap: 1.5,
              }}
            >
              <CircularProgress
                size={24}
              />

              <Typography
                color="text.secondary"
              >
                AI is analyzing{" "}
                {selectedProject
                  ? selectedProject.name
                  : "the project"}
                ...
              </Typography>
            </Box>
          )}

          {/* ==================================================
              AI RESPONSE
          ================================================== */}

          {answer &&
            !loadingAI && (
              <Paper
                elevation={0}
                sx={{
                  mt: 4,

                  p: 3,

                  borderRadius: 3,

                  border: "1px solid",

                  borderColor:
                    "divider",

                  backgroundColor:
                    "background.paper",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    mb: 1.5,
                  }}
                >
                  <AutoAwesome
                    color="primary"
                  />

                  <Typography
                    fontWeight={700}
                  >
                    AI Response
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    lineHeight: 1.8,

                    whiteSpace:
                      "pre-wrap",

                    fontFamily:
                      "inherit",
                  }}
                >
                  {answer}
                </Typography>
              </Paper>
            )}

          {/* ==================================================
              SPACER
          ================================================== */}

          <Box
            sx={{
              flex: 1,
              minHeight: 80,
            }}
          />

          {/* ==================================================
              INFO
          ================================================== */}

          <Paper
            elevation={0}
            sx={{
              p: 2,

              borderRadius: 2,

              backgroundColor:
                "action.hover",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Select a project before
              requesting project AI
              analysis. Meeting summaries
              and action items require a
              specific meeting.
            </Typography>
          </Paper>
        </Paper>
      </Container>
    </Box>
  );
};

export default AIPage;