import type { ReactNode } from "react";

import { Box, Typography } from "@mui/material";

// ============================================================
// PROPS
// ============================================================

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

// ============================================================
// PAGE HEADER
// ============================================================

const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
        flexWrap: "wrap",
      }}
    >
      {/* ====================================================
          TITLE
      ==================================================== */}

      <Box>
        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
          sx={{
            mb: subtitle ? 0.5 : 0,
          }}
        >
          {title}
        </Typography>

        {/* ==================================================
            SUBTITLE
        ================================================== */}

        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* ====================================================
          OPTIONAL ACTION
      ==================================================== */}

      {action && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {action}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
