import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Alert, Box, CircularProgress, Container, Paper } from "@mui/material";

import MeetingForm from "../../components/meeting/MeetingForm";
import meetingService from "../../services/meeting.service";
import api from "../../services/api";

import type {
  Meeting,
  CreateMeetingPayload,
  UserReference,
  ProjectReference,
} from "../../types/meeting.types";

const CreateMeetingPage = () => {
  const { projectId: routeProjectId } = useParams<{
    projectId?: string;
  }>();

  const navigate = useNavigate();

  // ============================================================
  // OPTIONAL PROJECT ID FROM URL
  // ============================================================

  const initialProjectId =
    typeof routeProjectId === "string" && routeProjectId.trim().length > 0
      ? routeProjectId.trim()
      : "";

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

        const rawUsers =
          response.data?.data ?? response.data?.users ?? response.data ?? [];

        if (!Array.isArray(rawUsers)) {
          setUsers([]);
          return;
        }

        const normalizedUsers: UserReference[] = rawUsers
          .map((user: any) => ({
            id: String(user.id ?? user._id ?? ""),

            name:
              user.name ??
              `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),

            email: user.email ?? "",

            role: user.role,

            avatar: user.avatar,
          }))
          .filter((user: UserReference) => Boolean(user.id));

        setUsers(normalizedUsers);
      } catch (err: any) {
        console.error("Failed to load users:", err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to load users.",
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    void loadUsers();
  }, []);

  // ============================================================
  // LOAD PROJECTS
  // ============================================================

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);

        const response = await api.get("/projects");

        const rawProjects =
          response.data?.data ?? response.data?.projects ?? response.data ?? [];

        if (!Array.isArray(rawProjects)) {
          setProjects([]);
          return;
        }

        const normalizedProjects: ProjectReference[] = rawProjects
          .map((project: any) => ({
            id: String(project.id ?? project._id ?? ""),

            name: project.name ?? "",
          }))
          .filter((project: ProjectReference) => Boolean(project.id));

        setProjects(normalizedProjects);
      } catch (err: any) {
        console.error("Failed to load projects:", err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
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
  // CREATE MEETING
  // ============================================================

  const handleSubmit = async (data: CreateMeetingPayload) => {
    /*
     * projectId now comes from the MeetingForm.
     *
     * This means:
     *
     * /meetings/create
     *
     * works without a project ID in the URL.
     */

    if (!data.projectId || !data.projectId.trim()) {
      setError("Please select a project.");

      return;
    }

    try {
      setLoading(true);

      setError("");

      const meetingData: CreateMeetingPayload = {
        ...data,

        projectId: data.projectId.trim(),
      };

      console.log("Creating meeting:", meetingData);

      const meeting: Meeting = await meetingService.createMeeting(meetingData);

      console.log("Created meeting:", meeting);

      // ========================================================
      // OPEN CREATED MEETING
      // ========================================================

      if (meeting?.id) {
        navigate(`/meetings/${meeting.id}`, {
          replace: true,
        });

        return;
      }

      // ========================================================
      // FALLBACK
      // ========================================================

      navigate("/meetings", {
        replace: true,
      });
    } catch (err: any) {
      console.error("Failed to create meeting:", err);

      const backendErrors = err?.response?.data?.errors;

      const message =
        Array.isArray(backendErrors) && backendErrors.length > 0
          ? backendErrors.join(" ")
          : err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to create meeting.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOADING
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
    <Container
      maxWidth="md"
      sx={{
        py: 5,
      }}
    >
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
          onClose={() => setError("")}
        >
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
          projectId={initialProjectId}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Paper>
    </Container>
  );
};

export default CreateMeetingPage;
