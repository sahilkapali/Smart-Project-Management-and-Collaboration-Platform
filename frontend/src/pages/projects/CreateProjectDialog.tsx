import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import projectService from "../../services/project.service";

import type { CreateProjectPayload } from "../../types/project.types";

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const CreateProjectDialog = ({
  open,
  onClose,
  onCreated,
}: CreateProjectDialogProps) => {
  const [projectName, setProjectName] = useState("");

  const [description, setDescription] = useState("");

  const [status, setStatus] = useState("PENDING");

  const [teamId, setTeamId] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const resetForm = () => {
    setProjectName("");
    setDescription("");
    setStatus("PENDING");
    setTeamId("");
    setStartDate("");
    setEndDate("");
    setError("");
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError("");

    if (!projectName.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!teamId.trim()) {
      setError("Team ID is required.");
      return;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError("End date cannot be before start date.");
      return;
    }

    const payload: CreateProjectPayload = {
      name: projectName.trim(),

      description: description.trim(),

      status,

      teamId: teamId.trim(),

      ...(startDate
        ? {
            startDate,
          }
        : {}),

      ...(endDate
        ? {
            endDate,
          }
        : {}),
    };

    try {
      setLoading(true);

      await projectService.createProject(payload);

      resetForm();

      onCreated?.();

      onClose();
    } catch (err: any) {
      console.error("Create project failed:", err);

      const backendMessage =
        err?.response?.data?.message || err?.response?.data?.error;

      setError(
        backendMessage ||
          "Unable to create project. Please check the Team ID and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: {
            xs: 1,
            sm: 2,
          },
        },
      }}
    >
      <DialogContent>
        <Stack spacing={2.25}>
          {/* Header */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: "1.7rem",
                  sm: "2rem",
                },
                fontWeight: 700,
              }}
            >
              Create Project
            </Typography>

            <IconButton
              onClick={handleClose}
              disabled={loading}
              sx={{
                color: "text.secondary",
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          {/* Error */}

          {error && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          {/* Project Name */}

          <TextField
            label="Project Name"
            required
            fullWidth
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            disabled={loading}
          />

          {/* Description */}

          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={loading}
          />

          {/* Team ID */}

          <TextField
            label="Team ID"
            required
            fullWidth
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            disabled={loading}
            placeholder="Enter an existing team ID"
            helperText="Enter the ID of an existing team that you belong to."
          />

          {/* Status */}

          <TextField
            select
            label="Status"
            fullWidth
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            disabled={loading}
          >
            <MenuItem value="PENDING">Pending</MenuItem>

            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>

            <MenuItem value="COMPLETED">Completed</MenuItem>

            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </TextField>

          {/* Dates */}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 2,
            }}
          >
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              disabled={loading}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              disabled={loading}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>

          {/* Buttons */}

          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={1.5}
            sx={{
              pt: 1,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
              sx={{
                minWidth: 120,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                minWidth: 170,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
