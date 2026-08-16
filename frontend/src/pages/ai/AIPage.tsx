import { useState } from "react";

import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import aiService from "../../services/ai.service";

import AIResponseCard from "../../components/ai/AIResponseCard";
import AILoading from "../../components/ai/AILoading";

const AIPage = () => {
  const [question, setQuestion] =
    useState("");

  const [response, setResponse] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleAsk = async () => {
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResponse("");

      const result =
        await aiService.askAI({
          question: question.trim(),
        });

      const aiData = result.data;

      setResponse(
        aiData?.response ||
          aiData?.answer ||
          aiData?.summary ||
          "AI returned no response.",
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to get an AI response.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 3,
              md: 5,
            },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography
                variant="h3"
                fontWeight={800}
              >
                AI Assistant
              </Typography>

              <Typography color="text.secondary">
                Ask questions and get intelligent
                assistance for your project.
              </Typography>
            </Stack>

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <TextField
              label="Ask the AI"
              placeholder="Ask something about your project..."
              multiline
              minRows={5}
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              fullWidth
            />

            <Button
              variant="contained"
              size="large"
              startIcon={<AutoAwesomeIcon />}
              onClick={handleAsk}
              disabled={loading}
            >
              Ask AI
            </Button>
          </Stack>
        </Paper>

        {loading && <AILoading />}

        {!loading && response && (
          <AIResponseCard
            response={response}
          />
        )}
      </Stack>
    </Container>
  );
};

export default AIPage;