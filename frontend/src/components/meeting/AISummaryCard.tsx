import { Box, Paper, Stack, Typography } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";

interface AISummaryCardProps {
  summary: string;
}

const AISummaryCard = ({ summary }: AISummaryCardProps) => {
  // If there is no summary yet, we don't render the card
  if (!summary) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <AutoAwesome color="primary" />
          <Typography variant="h6" fontWeight={700}>
            AI Summary
          </Typography>
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Typography 
            variant="body1" 
            sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}
          >
            {summary}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default AISummaryCard;