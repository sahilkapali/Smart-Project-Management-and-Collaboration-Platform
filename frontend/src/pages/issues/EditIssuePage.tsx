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

import type { IssuePriority, IssueStatus } from "../../types/issue.types";

const EditIssuePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // ============================================================
  // STATE
  // ============================================================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [priority, setPriority] = useState<IssuePriority>("Medium");

  const [status, setStatus] = useState<IssueStatus>("Open");

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

        setPriority(issue.priority || "Medium");

        setStatus(issue.status || "Open");

        if (typeof issue.assignedTo === "object") {
          setAssignedTo(issue.assignedTo?._id || "");
        } else {
          setAssignedTo(issue.assignedTo || "");
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
  // SAVE
  // ============================================================

  const handleSave = async () => {
    if (!id) {
      setError("Issue ID is missing.");
      return;
    }

    if (!title.trim()) {
      setError("Issue title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateIssue(id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        assignedTo: assignedTo.trim() || undefined,
      });

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
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 400,
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
  // UI
  // ============================================================

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 900,
        mx: "auto",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(-1)}
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
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              fullWidth
              label="Issue Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              multiline
              minRows={5}
            />

            <FormControl fullWidth>
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

            <FormControl fullWidth>
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

            <TextField
              fullWidth
              label="Assigned User ID"
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
              helperText="Optional"
            />

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
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
                disabled={saving}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  minWidth: 130,
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
