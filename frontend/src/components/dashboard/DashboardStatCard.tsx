import type { ReactNode } from "react";

import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

interface DashboardStatCardProps {
  title: string;

  value: string | number;

  subtitle: string;

  icon: ReactNode;

  chart?: ReactNode;

  onClick?: () => void;
}

const DashboardStatCard = ({
  title,

  value,

  subtitle,

  icon,

  chart,

  onClick,
}: DashboardStatCardProps) => {
  const clickable =
    typeof onClick === "function";

  return (
    <Paper
      component={clickable ? "button" : "div"}
      type={
        clickable
          ? "button"
          : undefined
      }
      onClick={onClick}
      elevation={0}
      sx={{
        width: "100%",

        height: "100%",

        minHeight: 116,

        p: 2,

        borderRadius: 3,

        border: "1px solid",

        borderColor: "divider",

        bgcolor: "background.paper",

        overflow: "hidden",

        textAlign: "left",

        font: "inherit",

        color: "inherit",

        cursor: clickable
          ? "pointer"
          : "default",

        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",

        "&:hover": clickable
          ? {
              transform:
                "translateY(-2px)",

              boxShadow: 3,

              borderColor:
                "primary.main",
            }
          : undefined,

        "&:focus-visible":
          clickable
            ? {
                outline:
                  "2px solid",

                outlineColor:
                  "primary.main",

                outlineOffset: 2,
              }
            : undefined,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1.5}
        sx={{
          height: "100%",
        }}
      >
        <Box
          sx={{
            minWidth: 0,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: 34,

                height: 34,

                borderRadius: 2,

                display: "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                bgcolor:
                  "primary.main",

                color:
                  "primary.contrastText",

                flexShrink: 0,
              }}
            >
              {icon}
            </Box>

            <Typography
              variant="body1"
              fontWeight={700}
              noWrap
            >
              {title}
            </Typography>
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
          >
            {subtitle}
          </Typography>

          <Typography
            variant="h4"
            fontWeight={700}
            lineHeight={1}
            sx={{
              mt: 0.5,
            }}
          >
            {value}
          </Typography>

          {clickable && (
            <Typography
              variant="caption"
              color="primary.main"
              sx={{
                display:
                  "block",

                mt: 0.75,

                fontWeight: 700,
              }}
            >
              Click to view details
            </Typography>
          )}
        </Box>

        {chart}
      </Stack>
    </Paper>
  );
};

export default DashboardStatCard;