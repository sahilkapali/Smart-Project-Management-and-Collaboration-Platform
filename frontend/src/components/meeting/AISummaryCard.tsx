import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import ReactMarkdown from "react-markdown";

interface AISummaryCardProps {
  summary?: string;

  onGenerate: () => void;

  loading?: boolean;

  error?: string;

  onClearError?: () => void;
}

const AISummaryCard = ({
  summary = "",
  onGenerate,
  loading = false,
  error = "",
  onClearError,
}: AISummaryCardProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: {
          xs: 2,
          sm: 3,
        },

        borderRadius: 3,

        border: "1px solid",

        borderColor: "divider",
      }}
    >
      <Stack spacing={3}>

        {/* ================================================= */}
        {/* HEADER                                            */}
        {/* ================================================= */}

        <Stack spacing={0.5}>
          <Typography
            variant="h5"
            fontWeight={700}
          >
            AI Meeting Summary
          </Typography>

          <Typography
            color="text.secondary"
          >
            Generate an AI summary from the
            selected meeting note.
          </Typography>
        </Stack>

        {/* ================================================= */}
        {/* ERROR                                             */}
        {/* ================================================= */}

        {error && (
          <Alert
            severity="error"
            onClose={onClearError}
          >
            {error}
          </Alert>
        )}

        {/* ================================================= */}
        {/* GENERATE BUTTON                                    */}
        {/* ================================================= */}

        <Button
          variant="contained"
          startIcon={
            loading ? undefined : (
              <AutoAwesomeIcon />
            )
          }
          onClick={onGenerate}
          disabled={loading}
          sx={{
            alignSelf: "flex-start",

            minWidth: {
              xs: "100%",
              sm: "auto",
            },

            textTransform: "none",

            fontWeight: 700,
          }}
        >
          {loading
            ? "Generating summary..."
            : summary
              ? "Regenerate AI Summary"
              : "Generate AI Summary"}
        </Button>

        {/* ================================================= */}
        {/* LOADING                                           */}
        {/* ================================================= */}

        {loading && (
          <Alert severity="info">
            AI is analyzing the meeting note.
            This may take a few seconds.
          </Alert>
        )}

        {/* ================================================= */}
        {/* SUMMARY                                           */}
        {/* ================================================= */}

        {!loading && summary && (
          <Paper
            variant="outlined"
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },

              borderRadius: 2,

              bgcolor:
                "background.default",
            }}
          >
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{
                mb: 2,
                fontWeight: 700,
              }}
            >
              Generated Summary
            </Typography>

            <Box
              sx={{
                color: "text.primary",

                lineHeight: 1.75,

                overflowWrap:
                  "anywhere",

                "& p": {
                  mt: 0,
                  mb: 1.5,
                },

                "& p:last-child": {
                  mb: 0,
                },

                "& h1, & h2, & h3, & h4":
                  {
                    mt: 2,
                    mb: 1,
                    fontWeight: 700,
                  },

                "& ul, & ol": {
                  pl: 3,
                  mb: 1.5,
                },

                "& li": {
                  mb: 0.5,
                },

                "& blockquote": {
                  m: 0,
                  mb: 1.5,
                  pl: 2,

                  borderLeft:
                    "3px solid",

                  borderColor:
                    "divider",

                  color:
                    "text.secondary",
                },

                "& code": {
                  px: 0.5,
                  py: 0.25,

                  borderRadius: 1,

                  backgroundColor:
                    "action.hover",

                  fontFamily:
                    "monospace",
                },

                "& pre": {
                  p: 2,

                  mb: 1.5,

                  overflowX:
                    "auto",

                  borderRadius: 2,

                  backgroundColor:
                    "action.hover",
                },

                "& a": {
                  color:
                    "primary.main",
                },
              }}
            >
              <ReactMarkdown>
                {summary}
              </ReactMarkdown>
            </Box>
          </Paper>
        )}

        {/* ================================================= */}
        {/* EMPTY STATE                                       */}
        {/* ================================================= */}

        {!loading &&
          !summary &&
          !error && (
            <Alert severity="info">
              No AI summary has been generated
              yet.
            </Alert>
          )}

      </Stack>
    </Paper>
  );
};

export default AISummaryCard;