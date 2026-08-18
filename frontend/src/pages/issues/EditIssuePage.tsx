import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import { getIssueById, updateIssue } from "../../services/issues.service";

import type {
  IssuePriority,
  IssueStatus,
  UpdateIssuePayload,
} from "../../types/issue.types";

const EditIssuePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // ============================================================
  // STATE
  // ============================================================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [status, setStatus] = useState<IssueStatus>("Open");
  const [priority, setPriority] = useState<IssuePriority>("Medium");

  const [assignedTo, setAssignedTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // LOAD ISSUE
  // ============================================================

  useEffect(() => {
    const loadIssue = async () => {
      if (!id) {
        setError("Issue ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const issue = await getIssueById(id);

        setTitle(issue.title || "");
        setDescription(issue.description || "");

        setStatus(issue.status || "Open");
        setPriority(issue.priority || "Medium");

        // assignedTo can be:
        // string
        // populated user object
        // null
        // undefined

        if (typeof issue.assignedTo === "string") {
          setAssignedTo(issue.assignedTo);
        } else if (issue.assignedTo && typeof issue.assignedTo === "object") {
          setAssignedTo(issue.assignedTo._id || "");
        } else {
          setAssignedTo("");
        }
      } catch (err: any) {
        console.error("Failed to load issue:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load issue.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadIssue();
  }, [id]);

  // ============================================================
  // SAVE ISSUE
  // ============================================================

  const handleSave = async () => {
    if (!id) {
      setError("Issue ID is missing.");
      return;
    }

    // ----------------------------------------------------------
    // TITLE VALIDATION
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

    try {
      setSaving(true);
      setError("");

      // --------------------------------------------------------
      // UPDATE PAYLOAD
      // --------------------------------------------------------

      const payload: UpdateIssuePayload = {
        title: trimmedTitle,
        description: description.trim() || undefined,
        status,
        priority,
        assignedTo: assignedTo.trim() || undefined,
      };

      console.log("Updating issue:", id);
      console.log("Update payload:", payload);

      // --------------------------------------------------------
      // API CALL
      // --------------------------------------------------------

      await updateIssue(id, payload);

      // --------------------------------------------------------
      // REDIRECT
      // --------------------------------------------------------

      navigate(`/issues/${id}`);
    } catch (err: any) {
      console.error("Update issue failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update issue.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CANCEL
  // ============================================================

  const handleCancel = () => {
    if (saving) {
      return;
    }

    navigate(-1);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />

          <Typography color="text.secondary">Loading issue...</Typography>
        </Stack>
      </Box>
    );
  }

  // ============================================================
  // PAGE
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
          disabled={saving}
          sx={{
            textTransform: "none",
          }}
        >
          Back
        </Button>

        <Typography variant="h4" fontWeight={700}>
          Edit Issue
        </Typography>
      </Stack>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

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
                TITLE
            ================================================== */}

            <TextField
              fullWidth
              label="Issue Title"
              placeholder="Enter issue title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={saving}
              required
            />

            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <TextField
              fullWidth
              label="Description"
              placeholder="Describe the issue"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              multiline
              minRows={5}
              disabled={saving}
            />

            {/* ==================================================
                STATUS
            ================================================== */}

            <FormControl fullWidth disabled={saving}>
              <InputLabel>Status</InputLabel>

              <Select
                value={status}
                label="Status"
                onChange={(event) =>
                  setStatus(event.target.value as IssueStatus)
                }
              >
                <MenuItem value="Open">Open</MenuItem>

                <MenuItem value="In Progress">In Progress</MenuItem>

                <MenuItem value="Resolved">Resolved</MenuItem>

                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>

            {/* ==================================================
                PRIORITY
            ================================================== */}

            <FormControl fullWidth disabled={saving}>
              <InputLabel>Priority</InputLabel>

              <Select
                value={priority}
                label="Priority"
                onChange={(event) =>
                  setPriority(event.target.value as IssuePriority)
                }
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
              onChange={(event) => setAssignedTo(event.target.value)}
              helperText="Optional"
              disabled={saving}
            />

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                startIcon={<SaveRoundedIcon />}
                onClick={() => void handleSave()}
                disabled={saving || !title.trim()}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  minWidth: 140,
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditIssuePage;
