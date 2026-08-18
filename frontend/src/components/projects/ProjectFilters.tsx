import {
  Box,
  FormControl,
  InputBase,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import type { ProjectStatus } from "../../types/project.types";

// ============================================================
// PROPS
// ============================================================

interface ProjectFiltersProps {
  search: string;

  status: "ALL" | ProjectStatus;

  onSearchChange: (value: string) => void;

  onStatusChange: (value: "ALL" | ProjectStatus) => void;
}

// ============================================================
// STATUS OPTIONS
// ============================================================

const STATUS_OPTIONS: Array<{
  value: "ALL" | ProjectStatus;
  label: string;
}> = [
  {
    value: "ALL",
    label: "All Statuses",
  },
  {
    value: "PLANNING",
    label: "Planning",
  },
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "ARCHIVED",
    label: "Archived",
  },
];

// ============================================================
// PROJECT FILTERS
// ============================================================

const ProjectFilters = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: ProjectFiltersProps) => {
  return (
    <Stack
      direction={{
        xs: "column",
        sm: "row",
      }}
      spacing={1.5}
      sx={{
        width: "100%",
      }}
    >
      {/* ====================================================
          SEARCH
      ==================================================== */}

      <Box
        sx={{
          height: 42,

          flex: 1,

          minWidth: 0,

          display: "flex",

          alignItems: "center",

          px: 1.5,

          border: "1px solid",

          borderColor: "divider",

          borderRadius: 2,

          bgcolor: "background.paper",

          transition: "border-color 0.2s ease",

          "&:focus-within": {
            borderColor: "primary.main",
          },
        }}
      >
        <SearchRoundedIcon
          sx={{
            color: "text.secondary",

            mr: 1,

            fontSize: 20,

            flexShrink: 0,
          }}
        />

        <InputBase
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search projects..."
          fullWidth
          inputProps={{
            "aria-label": "Search projects",
          }}
          sx={{
            fontSize: 14,
          }}
        />
      </Box>

      {/* ====================================================
          STATUS FILTER
      ==================================================== */}

      <FormControl
        size="small"
        sx={{
          minWidth: {
            xs: "100%",
            sm: 160,
          },
        }}
      >
        <Select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as "ALL" | ProjectStatus)
          }
          aria-label="Filter projects by status"
          sx={{
            height: 42,

            borderRadius: 2,

            bgcolor: "background.paper",
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};

export default ProjectFilters;
