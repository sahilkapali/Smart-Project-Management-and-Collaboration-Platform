import type{ ReactNode } from "react";
import { Box, Paper } from "@mui/material";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F5F7FB",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 450,
          p: 5,
          borderRadius: 4,
        }}
      >
        {children}
      </Paper>
    </Box>
  );
};

export default AuthLayout;