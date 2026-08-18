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
  onGenerate: () => void;
  loading: boolean;
}

const AISummaryCard = ({
  summary,
  onGenerate,
  loading,
}: AISummaryCardProps) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        background:
          "linear-gradient(135deg, rgba(25,118,210,0.08), rgba(156,39,176,0.08))",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* =====================================================
              HEADER
          ===================================================== */}

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

          {/* =====================================================
              SUMMARY
          ===================================================== */}

          {summary?.trim() ? (
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.7,
              }}
            >
              {summary}
            </Typography>
          ) : (
            <Typography color="text.secondary">
              Generate an AI summary from the meeting notes.
            </Typography>
          )}

          {/* =====================================================
              GENERATE BUTTON
          ===================================================== */}

          <Button
            variant="contained"
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <AutoAwesomeIcon />
              )
            }
            onClick={onGenerate}
            disabled={loading}
            sx={{
              alignSelf: "flex-start",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {loading ? "Generating..." : "Generate Summary"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AISummaryCard;
