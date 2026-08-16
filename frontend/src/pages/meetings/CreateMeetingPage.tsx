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
  CreateMeetingData,
} from "../../types/meeting.types";

const CreateMeetingPage = () => {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const navigate = useNavigate();

  const [users, setUsers] = useState<UserReference[]>(
    [],
  );

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        /*
         * Adjust this endpoint if your user.routes.ts
         * exposes project/team members differently.
         */
        const response = await api.get("/users");

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

  const handleSubmit = async (
    data: CreateMeetingData,
  ) => {
    try {
      setLoading(true);

      const response =
        await meetingService.createMeeting(data);

      navigate(
        `/meetings/${response.data._id}`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (!projectId) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error">
          Project ID is missing.
        </Alert>
      </Container>
    );
  }

  if (loadingUsers) {
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
    <Container maxWidth="md" sx={{ py: 5 }}>
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
          projectId={projectId}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Paper>
    </Container>
  );
};

export default CreateMeetingPage;