import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  setMode: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export const CustomThemeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem("appThemeMode");

    if (
      savedMode === "light" ||
      savedMode === "dark" ||
      savedMode === "system"
    ) {
      return savedMode;
    }

    return "dark";
  });

  const [systemMode, setSystemMode] = useState<"light" | "dark">(
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );

  // ============================
  // SYSTEM THEME LISTENER
  // ============================

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemMode(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // ============================
  // CHANGE THEME
  // ============================

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("appThemeMode", newMode);
  };

  // ============================
  // ACTIVE MODE
  // ============================

  const activePaletteMode = mode === "system" ? systemMode : mode;

  // ============================
  // MATERIAL UI THEME
  // ============================

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: activePaletteMode,

          primary: {
            main: "#2563EB",
          },

          secondary: {
            main: "#7C3AED",
          },

          background:
            activePaletteMode === "dark"
              ? {
                  default: "#0f172a",
                  paper: "#1e293b",
                }
              : {
                  default: "#f8fafc",
                  paper: "#ffffff",
                },

          text:
            activePaletteMode === "dark"
              ? {
                  primary: "#f8fafc",
                  secondary: "#cbd5e1",
                }
              : {
                  primary: "#111827",
                  secondary: "#6b7280",
                },

          divider: activePaletteMode === "dark" ? "#334155" : "#e5e7eb",
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
      }),
    [activePaletteMode],
  );

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
