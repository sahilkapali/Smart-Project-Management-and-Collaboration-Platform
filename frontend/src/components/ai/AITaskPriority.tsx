import { useState } from "react";

import {
  Alert,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import aiService from "../../services/ai.service";

import AILoading from "./AILoading";

interface AITaskPriorityProps {
  taskId: string;

  currentPriority?: string;

  onPriorityUpdated?: (
    priority: string,
  ) => void;
}

const AITaskPriority = ({
  taskId,
  currentPriority,
  onPriorityUpdated,
}: AITaskPriorityProps) => {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [priority, setPriority] =
    useState(currentPriority || "");

  const handlePrioritize = async () => {
    if (!taskId) {
      setError("Task ID is missing.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result =
        await aiService.prioritizeTask(
          taskId,
        );

      const newPriority =
        result.data?.priority;

      if (!newPriority) {
        setError(
          "AI did not return a task priority.",
        );
        return;
      }

      setPriority(newPriority);

      onPriorityUpdated?.(
        newPriority,
      );
    } catch (err: any) {
      console.error(
        "AI task prioritization failed:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          "Unable to prioritize task with AI.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      {loading ? (
        <AILoading message="Prioritizing task with AI..." />
      ) : (
        <Button
          variant="outlined"
          startIcon={<AutoAwesomeIcon />}
          onClick={handlePrioritize}
        >
          Prioritize with AI
        </Button>
      )}

      {priority && !loading && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            AI Recommended / Updated Priority:
          </Typography>

          <Chip
            label={priority}
            color={
              priority === "Critical"
                ? "error"
                : priority === "High"
                  ? "warning"
                  : "default"
            }
          />
        </Stack>
      )}
    </Stack>
  );
};

export default AITaskPriority;