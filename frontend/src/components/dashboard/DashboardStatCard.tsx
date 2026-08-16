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
}

const DashboardStatCard = ({
  title,
  value,
  subtitle,
  icon,
  chart,
}: DashboardStatCardProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        minHeight: 116,
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1.5}
        sx={{ height: "100%" }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 1 }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
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
            sx={{ mt: 0.5 }}
          >
            {value}
          </Typography>
        </Box>

        {chart}
      </Stack>
    </Paper>
  );
};

export default DashboardStatCard;