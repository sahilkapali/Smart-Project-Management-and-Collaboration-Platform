import {
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";

interface AILoadingProps {
  message?: string;
}

const AILoading = ({
  message = "AI is processing...",
}: AILoadingProps) => {
  return (
    <Box
      sx={{
        display: "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        gap: 2,

        py: 4,
      }}
    >
      <CircularProgress
        size={28}
      />

      <Typography
        color="text.secondary"
      >
        {message}
      </Typography>
    </Box>
  );
};

export default AILoading;