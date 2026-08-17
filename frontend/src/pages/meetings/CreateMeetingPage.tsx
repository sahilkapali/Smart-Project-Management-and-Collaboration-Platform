import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Container,
  Paper,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";

import MeetingForm from "../../components/meeting/MeetingForm";
import meetingService from "../../services/meeting.service";
import api from "../../services/api";

import type {
  UserReference,
  ProjectReference,
  CreateMeetingData,
} from "../../types/meeting.types";

const CreateMeetingPage = () => {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const navigate = useNavigate();

  /*
   * Users
   */
  const [users, setUsers] =
    useState<UserReference[]>([]);

  /*
   * Projects
   */
  const [projects, setProjects] =
    useState<ProjectReference[]>([]);

  /*
   * Loading states
   */
  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  /*
   * Error
   */
  const [error, setError] =
    useState("");

  /*
   * Load users
   */
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response =
          await api.get("/users");

        setUsers(
          response.data?.data ||
            response.data?.users ||
            [],
        );
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            "Unable to load users.",
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  /*
   * Load projects
   */
  useEffect(() => {
    const loadProjects = async () => {
      try {
        /*
         * Get all projects available to
         * the authenticated user.
         */
        const response =
          await api.get("/projects");

        const projectData =
          response.data?.data ||
            response.data?.projects ||
            [];

        setProjects(projectData);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            "Unable to load projects.",
        );
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  /*
   * Create meeting
   */
  const handleSubmit = async (
    data: CreateMeetingData,
  ) => {
    try {
      setLoading(true);
      setError("");

      /*
       * data.projectId is the project
       * selected in MeetingForm.
       */
      const response =
        await meetingService.createMeeting(
          data,
        );

      /*
       * MeetingResponse:
       *
       * {
       *   success: true,
       *   data: Meeting
       * }
       *
       * Therefore response.data is
       * the Meeting object.
       */
      const meetingId =
        response.data?._id;

      if (meetingId) {
        navigate(
          `/meetings/${meetingId}`,
        );
      } else {
        navigate("/meetings");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to create meeting.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Project ID is required by the
   * current route.
   */
  if (!projectId) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error">
          Project ID is missing.
        </Alert>
      </Container>
    );
  }

  /*
   * Wait for users and projects
   */
  if (
    loadingUsers ||
    loadingProjects
  ) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 10,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{ py: 5 }}
    >
      {error && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2,
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
          projectId={projectId}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Paper>
    </Container>
  );
};

export default CreateMeetingPage;