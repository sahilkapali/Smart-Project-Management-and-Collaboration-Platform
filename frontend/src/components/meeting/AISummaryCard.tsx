import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface AISummaryCardProps {
  summary?: string;
  onGenerate?: () => void;
  loading?: boolean;
}

const AISummaryCard = ({
  summary,
  onGenerate,
  loading = false,
}: AISummaryCardProps) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        background:
          "linear-gradient(135deg, rgba(25,118,210,0.08), rgba(156,39,176,0.08))",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AutoAwesomeIcon color="primary" />
            AI Summary
          </Typography>

          {summary ? (
            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-wrap" }}
            >
              {summary}
            </Typography>
          ) : (
            <Typography color="text.secondary">
              Generate an AI summary from the meeting
              notes.
            </Typography>
          )}

          {onGenerate && (
            <Button
              variant="contained"
              startIcon={
                loading ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <AutoAwesomeIcon />
                )
              }
              onClick={onGenerate}
              disabled={loading}
            >
              {loading
                ? "Generating..."
                : "Generate Summary"}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AISummaryCard;