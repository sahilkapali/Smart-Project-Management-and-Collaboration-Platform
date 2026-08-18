import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { createIssue } from "../../services/issues.service";

import type {
  CreateIssuePayload,
  IssuePriority,
} from "../../types/issue.types";

const CreateIssuePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ============================================================
  // STATE
  // ============================================================

  const [repositoryId, setRepositoryId] = useState("");

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [priority, setPriority] = useState<IssuePriority>("Medium");

  const [assignedTo, setAssignedTo] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // GET REPOSITORY ID FROM URL
  // ============================================================
  //
  // IMPORTANT:
  // repositoryId must be a Repository MongoDB ID.
  //
  // DO NOT use projectId here.
  //
  // Example:
  // /issues/create?repositoryId=64abc123...
  //
  // ============================================================

  useEffect(() => {
    const urlRepositoryId =
      searchParams.get("repositoryId") || searchParams.get("repository") || "";

    if (urlRepositoryId) {
      setRepositoryId(urlRepositoryId);
    }
  }, [searchParams]);

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async () => {
    setError("");

    // ----------------------------------------------------------
    // VALIDATE REPOSITORY
    // ----------------------------------------------------------

    const trimmedRepositoryId = repositoryId.trim();

    if (!trimmedRepositoryId) {
      setError("Repository ID is required.");
      return;
    }

    // ----------------------------------------------------------
    // VALIDATE TITLE
    // ----------------------------------------------------------

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Issue title is required.");
      return;
    }

    if (trimmedTitle.length < 3) {
      setError("Issue title must be at least 3 characters.");
      return;
    }

    // ----------------------------------------------------------
    // VALIDATE DESCRIPTION
    // ----------------------------------------------------------

    const trimmedDescription = description.trim();

    // ----------------------------------------------------------
    // VALIDATE ASSIGNED USER
    // ----------------------------------------------------------

    const trimmedAssignedTo = assignedTo.trim();

    try {
      setLoading(true);

      // --------------------------------------------------------
      // CREATE PAYLOAD
      // --------------------------------------------------------

      const payload: CreateIssuePayload = {
        repository: trimmedRepositoryId,

        title: trimmedTitle,

        description: trimmedDescription || undefined,

        priority,

        assignedTo: trimmedAssignedTo || undefined,
      };

      console.log("Creating issue with payload:", payload);

      // --------------------------------------------------------
      // API CALL
      // --------------------------------------------------------

      const createdIssue = await createIssue(payload);

      console.log("Issue created successfully:", createdIssue);

      // --------------------------------------------------------
      // GET CREATED ISSUE ID
      // --------------------------------------------------------

      const createdIssueId = createdIssue._id || createdIssue.id || "";

      // --------------------------------------------------------
      // NAVIGATE
      // --------------------------------------------------------

      if (createdIssueId) {
        navigate(`/issues/${createdIssueId}`);
      } else {
        navigate("/issues");
      }
    } catch (err: unknown) {
      console.error("Create issue failed:", err);

      const axiosError = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      setError(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Failed to create issue.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CANCEL
  // ============================================================

  const handleCancel = () => {
    if (loading) {
      return;
    }

    navigate(-1);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 900,
        mx: "auto",
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={handleCancel}
          disabled={loading}
          sx={{
            textTransform: "none",
          }}
        >
          Back
        </Button>

        <Typography variant="h4" fontWeight={700}>
          Create Issue
        </Typography>
      </Stack>

      {/* ======================================================
          FORM CARD
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            {/* ==================================================
                REPOSITORY
            ================================================== */}

            <TextField
              fullWidth
              label="Repository ID"
              placeholder="Enter repository MongoDB ID"
              value={repositoryId}
              onChange={(event) => {
                setRepositoryId(event.target.value);
              }}
              required
              disabled={loading}
              helperText={
                repositoryId.trim()
                  ? "Repository selected."
                  : "Enter the MongoDB ID of the repository."
              }
            />

            {/* ==================================================
                ISSUE TITLE
            ================================================== */}

            <TextField
              fullWidth
              label="Issue Title"
              placeholder="e.g. Login button is not working"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              required
              autoFocus
              disabled={loading}
              error={title.length > 0 && title.trim().length < 3}
              helperText={
                title.length > 0 && title.trim().length < 3
                  ? "Title must be at least 3 characters."
                  : "Provide a short and descriptive issue title."
              }
            />

            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <TextField
              fullWidth
              label="Description"
              placeholder="Describe the problem, expected behavior, and any relevant details."
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
              multiline
              minRows={5}
              disabled={loading}
              helperText="Optional"
            />

            {/* ==================================================
                PRIORITY
            ================================================== */}

            <FormControl fullWidth disabled={loading}>
              <InputLabel>Priority</InputLabel>

              <Select
                value={priority}
                label="Priority"
                onChange={(event) => {
                  setPriority(event.target.value as IssuePriority);
                }}
              >
                <MenuItem value="Low">Low</MenuItem>

                <MenuItem value="Medium">Medium</MenuItem>

                <MenuItem value="High">High</MenuItem>

                <MenuItem value="Critical">Critical</MenuItem>
              </Select>
            </FormControl>

            {/* ==================================================
                ASSIGNED USER
            ================================================== */}

            <TextField
              fullWidth
              label="Assigned User ID"
              placeholder="Enter user MongoDB ID"
              value={assignedTo}
              onChange={(event) => {
                setAssignedTo(event.target.value);
              }}
              disabled={loading}
              helperText="Optional. Leave empty if the issue is not assigned yet."
            />

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <Stack
              direction={{
                xs: "column-reverse",
                sm: "row",
              }}
              justifyContent="flex-end"
              spacing={2}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  minWidth: 120,
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => {
                  void handleSubmit();
                }}
                disabled={
                  loading ||
                  !repositoryId.trim() ||
                  !title.trim() ||
                  title.trim().length < 3
                }
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  minWidth: 150,
                }}
              >
                {loading ? "Creating..." : "Create Issue"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateIssuePage;
