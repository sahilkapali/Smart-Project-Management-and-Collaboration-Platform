import {
  Paper,
  Typography,
  Box,
} from "@mui/material";

interface AIResponseCardProps {
  title?: string;
  response: string;
}

const AIResponseCard = ({
  title = "AI Result",
  response,
}: AIResponseCardProps) => {
  if (!response) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: 2 }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
        }}
      >
        <Typography>
          {response}
        </Typography>
      </Box>
    </Paper>
  );
};

export default AIResponseCard;