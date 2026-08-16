import {
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";

const AILoading = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 5,
        gap: 2,
      }}
    >
      <CircularProgress />

      <Typography color="text.secondary">
        AI is thinking...
      </Typography>
    </Box>
  );
};

export default AILoading;