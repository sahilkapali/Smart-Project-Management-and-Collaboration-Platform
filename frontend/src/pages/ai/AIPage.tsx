import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Button,
  Typography,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import aiService from "../../services/ai.service";

import projectService from "../../services/project.service";

import type {
  Project,
} from "../../types/project.types";

import AIResponseCard from "../../components/ai/AIResponseCard";

import AILoading from "../../components/ai/AILoading";


const AIPage = () => {

  /* =======================================================
     PROJECTS
  ======================================================= */

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [selectedProjectId, setSelectedProjectId] =
    useState("");


  /* =======================================================
     LOADING STATES
  ======================================================= */

  const [projectsLoading, setProjectsLoading] =
    useState(true);

  const [loading, setLoading] =
    useState(false);


  /* =======================================================
     AI RESPONSE
  ======================================================= */

  const [response, setResponse] =
    useState("");


  /* =======================================================
     ERROR
  ======================================================= */

  const [error, setError] =
    useState("");


  /* =======================================================
     LOAD PROJECTS
  ======================================================= */

  useEffect(() => {

    const loadProjects = async () => {

      try {

        setProjectsLoading(true);

        setError("");

        const data =
          await projectService.getProjects();

        const projectsData =
          Array.isArray(data)
            ? data
            : [];

        setProjects(
          projectsData,
        );

      } catch (err: any) {

        console.error(
          "Failed to load projects:",
          err,
        );

        setError(
          err?.response?.data?.message ||
          "Unable to load projects.",
        );

      } finally {

        setProjectsLoading(false);

      }

    };


    loadProjects();

  }, []);


  /* =======================================================
     GET PROJECT ID
  ======================================================= */

  const getProjectId = (
    project: Project,
  ): string => {

    return String(
      project.id ||
      (project as any)._id ||
      "",
    );

  };


  /* =======================================================
     GENERATE AI INSIGHT
  ======================================================= */

  const handleGenerateInsight =
    async () => {

      if (!selectedProjectId) {

        setError(
          "Please select a project.",
        );

        return;
      }


      try {

        setLoading(true);

        setError("");

        setResponse("");


        const result =
          await aiService.getProjectInsight(
            selectedProjectId,
          );


        /* ===============================================
           AI DATA
        =============================================== */

        const aiData =
          result?.data;


        if (!aiData) {

          setResponse(
            "AI returned no response.",
          );

          return;
        }


        /* ===============================================
           EXTRACT AI RESPONSE
        =============================================== */

        const output =
          aiData.output ||
          aiData.response ||
          aiData.answer ||
          aiData.summary;


        if (
          typeof output ===
          "string"
        ) {

          setResponse(
            output,
          );

          return;
        }


        /* ===============================================
           FALLBACK
        =============================================== */

        setResponse(
          JSON.stringify(
            aiData,
            null,
            2,
          ),
        );

      } catch (err: any) {

        console.error(
          "AI insight failed:",
          err,
        );

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to generate AI insight.",
        );

      } finally {

        setLoading(false);

      }

    };


  /* =======================================================
     SELECTED PROJECT
  ======================================================= */

  const selectedProject =
    projects.find(
      (project) =>
        getProjectId(project) ===
        selectedProjectId,
    );


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <Container
      maxWidth="md"
      sx={{
        py: 6,
      }}
    >

      <Stack spacing={4}>

        {/* =================================================
            AI HEADER
        ================================================= */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 3,
              md: 5,
            },

            borderRadius: 4,

            border: "1px solid",

            borderColor:
              "divider",
          }}
        >

          <Stack spacing={3}>

            {/* =============================================
                TITLE
            ============================================= */}

            <Stack spacing={1}>

              <Typography
                variant="h3"
                fontWeight={800}
              >
                AI Assistant
              </Typography>


              <Typography
                color="text.secondary"
              >
                Generate intelligent insights
                and recommendations for your
                project.
              </Typography>

            </Stack>


            {/* =============================================
                ERROR
            ============================================= */}

            {error && (

              <Alert
                severity="error"
              >
                {error}
              </Alert>

            )}


            {/* =============================================
                PROJECT SELECT
            ============================================= */}

            <FormControl
              fullWidth
              disabled={
                projectsLoading ||
                loading
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

                  setResponse("");

                  setError("");

                }}
              >

                {projects.length ===
                  0 && (

                  <MenuItem
                    value=""
                    disabled
                  >
                    No projects available
                  </MenuItem>

                )}


                {projects.map(
                  (project) => {

                    const projectId =
                      getProjectId(
                        project,
                      );

                    return (

                      <MenuItem
                        key={
                          projectId
                        }
                        value={
                          projectId
                        }
                      >
                        {project.name ||
                          "Untitled Project"}
                      </MenuItem>

                    );

                  },
                )}

              </Select>

            </FormControl>


            {/* =============================================
                SELECTED PROJECT
            ============================================= */}

            {selectedProject && (

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,

                  borderRadius: 2,

                  bgcolor:
                    "action.hover",
                }}
              >

                <Stack spacing={0.5}>

                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                  >
                    {selectedProject.name ||
                      "Untitled Project"}
                  </Typography>


                  {selectedProject.description && (

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {
                        selectedProject.description
                      }
                    </Typography>

                  )}

                </Stack>

              </Paper>

            )}


            {/* =============================================
                AI BUTTON
            ============================================= */}

            <Button
              variant="contained"
              size="large"
              startIcon={
                <AutoAwesomeIcon />
              }
              onClick={
                handleGenerateInsight
              }
              disabled={
                loading ||
                projectsLoading ||
                !selectedProjectId
              }
              sx={{
                borderRadius: 2,

                textTransform:
                  "none",

                fontWeight: 700,

                py: 1.5,
              }}
            >
              {loading
                ? "Generating Insight..."
                : "Generate AI Insight"}
            </Button>

          </Stack>

        </Paper>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <AILoading />
        )}


        {/* =================================================
            RESPONSE
        ================================================= */}

        {!loading &&
          response && (

          <AIResponseCard
            response={
              response
            }
          />

        )}

      </Stack>

    </Container>

  );
};


export default AIPage;