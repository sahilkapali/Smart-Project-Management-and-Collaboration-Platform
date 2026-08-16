import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import { useEffect, useState } from "react";

import type { Project } from "../../types/project.types";

interface ProjectFormProps {
  project?: Project | null;

  loading?: boolean;

  error?: string;

  onSubmit: (
    data: Record<string, unknown>,
  ) => void;

  onCancel: () => void;
}

const ProjectForm = ({
  project,
  loading = false,
  error = "",
  onSubmit,
  onCancel,
}: ProjectFormProps) => {
  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState("pending");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  useEffect(() => {
    if (!project) {
      setName("");
      setDescription("");
      setStatus("pending");
      setStartDate("");
      setEndDate("");

      return;
    }

    setName(
      project.name ?? "",
    );

    setDescription(
      project.description ?? "",
    );

    setStatus(
      project.status ??
        "pending",
    );

    setStartDate(
      project.startDate
        ? project.startDate.slice(
            0,
            10,
          )
        : "",
    );

    setEndDate(
      project.endDate
        ? project.endDate.slice(
            0,
            10,
          )
        : "",
    );
  }, [project]);

  const handleSubmit = (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    onSubmit({
      name: name.trim(),
      description:
        description.trim(),
      status,
      startDate:
        startDate || null,
      endDate:
        endDate || null,
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
    >
      <Stack spacing={2.2}>
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        <TextField
          label="Project Name"
          value={name}
          onChange={(event) =>
            setName(
              event.target.value,
            )
          }
          required
          fullWidth
        />

        <TextField
          label="Description"
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value,
            )
          }
          multiline
          minRows={4}
          fullWidth
        />

        <TextField
          select
          label="Status"
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value,
            )
          }
          fullWidth
        >
          <MenuItem value="pending">
            Pending
          </MenuItem>

          <MenuItem value="in_progress">
            In Progress
          </MenuItem>

          <MenuItem value="completed">
            Completed
          </MenuItem>

          <MenuItem value="cancelled">
            Cancelled
          </MenuItem>
        </TextField>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
        >
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(event) =>
              setStartDate(
                event.target.value,
              )
            }
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />

          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(event) =>
              setEndDate(
                event.target.value,
              )
            }
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
        </Stack>

        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1.5}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={
              loading ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <SaveRoundedIcon />
              )
            }
            disabled={
              loading ||
              !name.trim()
            }
          >
            {project
              ? "Update Project"
              : "Create Project"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ProjectForm;