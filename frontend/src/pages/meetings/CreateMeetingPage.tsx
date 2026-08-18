import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Container, Paper, Alert, CircularProgress, Box } from "@mui/material";

import MeetingForm from "../../components/meeting/MeetingForm";
import meetingService from "../../services/meeting.service";
import api from "../../services/api";

import type {
  UserReference,
  ProjectReference,
  CreateMeetingData,
} from "../../types/meeting.types";

const CreateMeetingPage = () => {
  const { projectId: routeProjectId } = useParams<{
    projectId: string;
  }>();

  const navigate = useNavigate();

  // ============================================================
  // VALIDATE PROJECT ID
  // ============================================================

  /*
   * useParams() returns string | undefined.
   *
   * We validate it once and use validProjectId everywhere
   * after that so TypeScript knows it is definitely a string.
   */
  const validProjectId =
    typeof routeProjectId === "string" && routeProjectId.trim().length > 0
      ? routeProjectId.trim()
      : null;

  // ============================================================
  // STATE
  // ============================================================

  const [users, setUsers] = useState<UserReference[]>([]);

  const [projects, setProjects] = useState<ProjectReference[]>([]);

  const [loadingUsers, setLoadingUsers] = useState(true);

  const [loadingProjects, setLoadingProjects] = useState(true);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // LOAD USERS
  // ============================================================

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);

        const response = await api.get("/users");

        const userData = response.data?.data ?? response.data?.users ?? [];

        setUsers(Array.isArray(userData) ? userData : []);
      } catch (err: any) {
        console.error("Failed to load users:", err);

        setError(err?.response?.data?.message || "Unable to load users.");
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  // ============================================================
  // LOAD PROJECTS
  // ============================================================

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);

        const response = await api.get("/projects");

        const projectData =
          response.data?.data ?? response.data?.projects ?? [];

        setProjects(Array.isArray(projectData) ? projectData : []);
      } catch (err: any) {
        console.error("Failed to load projects:", err);

        setError(err?.response?.data?.message || "Unable to load projects.");
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  // ============================================================
  // CREATE MEETING
  // ============================================================

  const handleSubmit = async (data: CreateMeetingData) => {
    /*
     * Never trust projectId coming from the form.
     *
     * The project ID in the URL is the source of truth.
     */
    if (!validProjectId) {
      setError(
        "Project ID is missing. Please open the meeting page from a project.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const meetingData: CreateMeetingData = {
        ...data,
        projectId: validProjectId,
      };

      console.log("Creating meeting with projectId:", validProjectId);

      const response = await meetingService.createMeeting(meetingData);

      const meetingId = response?.data?._id;

      if (meetingId) {
        navigate(`/meetings/${meetingId}`, {
          replace: true,
        });

        return;
      }

      /*
       * If backend successfully creates the meeting
       * but does not return an ID, go back to the
       * project's meeting list.
       */
      navigate(`/projects/${validProjectId}/meetings`, {
        replace: true,
      });
    } catch (err: any) {
      console.error("Failed to create meeting:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to create meeting.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PROJECT ID MISSING
  // ============================================================

  if (!validProjectId) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Alert severity="error">Project ID is missing.</Alert>
      </Container>
    );
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loadingUsers || loadingProjects) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2,
            sm: 3,
            md: 4,
          },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <MeetingForm
          users={users}
          projects={projects}
          projectId={validProjectId}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Paper>
    </Container>
  );
};

export default CreateMeetingPage;
