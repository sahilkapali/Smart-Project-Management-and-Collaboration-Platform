import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#2563EB",
    },

    secondary: {
      main: "#7C3AED",
    },

    background: {
      default: "#F5F7FB",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#111827",
      secondary: "#6B7280",
    },

    divider: "#E5E7EB",
  },

  typography: {
    fontFamily: "'Poppins', sans-serif",

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 600,
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 12,
  },
});

export default theme;
