import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import {
  Alert,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import aiService from "../../services/ai.service";

import AILoading from "../../components/ai/AILoading";
import AIResponseCard from "../../components/ai/AIResponseCard";

import type {
  AIOutput,
} from "../../types/ai.types";

const AIPage = () => {
  const { projectId } =
    useParams<{
      projectId: string;
    }>();

  const [outputs, setOutputs] =
    useState<AIOutput[]>([]);

  const [insight, setInsight] =
    useState("");

  const [loadingHistory, setLoadingHistory] =
    useState(true);

  const [generatingInsight, setGeneratingInsight] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadHistory = async () => {
    if (!projectId) {
      setError("Project ID is missing.");
      setLoadingHistory(false);
      return;
    }

    try {
      setLoadingHistory(true);
      setError("");

      const result =
        await aiService.getProjectAIOutputs(
          projectId,
        );

      setOutputs(result.data || []);
    } catch (err: any) {
      console.error(
        "Failed to load AI history:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load project AI history.",
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [projectId]);

  const handleGenerateInsight = async () => {
    if (!projectId) {
      setError("Project ID is missing.");
      return;
    }

    try {
      setGeneratingInsight(true);
      setError("");
      setInsight("");

      const result =
        await aiService.generateProjectInsight(
          projectId,
        );

      const generated =
        result.data?.output;

      if (!generated) {
        setError(
          "AI returned no project insight.",
        );
        return;
      }

      setInsight(generated);

      await loadHistory();
    } catch (err: any) {
      console.error(
        "Project AI insight failed:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          "Unable to generate project insight.",
      );
    } finally {
      setGeneratingInsight(false);
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{ py: 5 }}
    >
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography
            variant="h3"
            fontWeight={800}
          >
            AI Assistant
          </Typography>

          <Typography color="text.secondary">
            AI insights and history for this
            project.
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Project ID: {projectId}
          </Typography>
        </Stack>

        {error && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={loadHistory}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography
                variant="h5"
                fontWeight={700}
              >
                Project AI Insight
              </Typography>

              <Typography color="text.secondary">
                Generate an AI analysis using
                the current project's information.
              </Typography>
            </Stack>

            {generatingInsight ? (
              <AILoading
                message="Generating project insight..."
              />
            ) : (
              <Button
                variant="contained"
                startIcon={
                  <AutoAwesomeIcon />
                }
                onClick={
                  handleGenerateInsight
                }
              >
                Generate Project Insight
              </Button>
            )}

            {insight && (
              <AIResponseCard
                title="Latest Project Insight"
                response={insight}
              />
            )}
          </Stack>
        </Paper>

        <Divider />

        <Stack spacing={2}>
          <Typography
            variant="h5"
            fontWeight={700}
          >
            AI History
          </Typography>

          {loadingHistory ? (
            <AILoading message="Loading AI history..." />
          ) : outputs.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography color="text.secondary">
                No AI outputs have been generated
                for this project yet.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {outputs.map((item) => (
                <AIResponseCard
                  key={
                    item._id ||
                    `${item.type}-${item.createdAt}`
                  }
                  title={formatAIType(item.type)}
                  response={item.output}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Container>
  );
};

const formatAIType = (
  type: AIOutput["type"],
) => {
  switch (type) {
    case "TASK_PRIORITY":
      return "Task Priority";

    case "MEETING_SUMMARY":
      return "Meeting Summary";

    case "ACTION_ITEMS":
      return "Action Items";

    case "INSIGHT":
      return "Project Insight";

    default:
      return "AI Result";
  }
};

export default AIPage;