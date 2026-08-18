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

  useEffect(() => {
    const urlRepositoryId =
      searchParams.get("repositoryId") ||
      searchParams.get("repository") ||
      searchParams.get("projectId") ||
      "";

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

    if (!repositoryId.trim()) {
      setError("Repository ID is required.");
      return;
    }

    // ----------------------------------------------------------
    // VALIDATE TITLE
    // ----------------------------------------------------------

    if (!title.trim()) {
      setError("Issue title is required.");
      return;
    }

    if (title.trim().length < 3) {
      setError("Issue title must be at least 3 characters.");
      return;
    }

    try {
      setLoading(true);

      // --------------------------------------------------------
      // CREATE PAYLOAD
      // --------------------------------------------------------

      const payload: CreateIssuePayload = {
        repository: repositoryId.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        assignedTo: assignedTo.trim() || undefined,
      };

      console.log("Creating issue with payload:", payload);

      // --------------------------------------------------------
      // API CALL
      // --------------------------------------------------------

      const createdIssue = await createIssue(payload);

      console.log("Issue created successfully:", createdIssue);

      // --------------------------------------------------------
      // NAVIGATE TO CREATED ISSUE
      // --------------------------------------------------------

      if (createdIssue?._id) {
        navigate(`/issues/${createdIssue._id}`);
      } else if (createdIssue?.id) {
        navigate(`/issues/${createdIssue.id}`);
      } else {
        navigate("/issues");
      }
    } catch (err: any) {
      console.error("Create issue failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
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
          FORM
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
                REPOSITORY ID
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
              helperText={
                repositoryId.trim()
                  ? "Repository ID entered."
                  : "Enter the MongoDB repository ID."
              }
              disabled={loading}
            />

            {/* ==================================================
                ISSUE TITLE
            ================================================== */}

            <TextField
              fullWidth
              label="Issue Title"
              placeholder="Enter issue title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              required
              autoFocus
              disabled={loading}
            />

            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <TextField
              fullWidth
              label="Description"
              placeholder="Describe the issue"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
              multiline
              minRows={5}
              disabled={loading}
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
              helperText="Optional"
              disabled={loading}
            />

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
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
                disabled={loading || !repositoryId.trim() || !title.trim()}
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
