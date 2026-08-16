import {
  Box,
  FormControl,
  InputBase,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

interface ProjectFiltersProps {
  search: string;

  status: string;

  onSearchChange: (
    value: string,
  ) => void;

  onStatusChange: (
    value: string,
  ) => void;
}

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
      {/* Search */}

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

          bgcolor:
            "background.paper",
        }}
      >
        <SearchRoundedIcon
          sx={{
            color:
              "text.secondary",
            mr: 1,
            fontSize: 20,
          }}
        />

        <InputBase
          value={search}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
          placeholder="Search projects..."
          fullWidth
          sx={{
            fontSize: 14,
          }}
        />
      </Box>

      {/* Status */}

      <FormControl
        size="small"
        sx={{
          minWidth: {
            xs: "100%",
            sm: 130,
          },
        }}
      >
        <Select
          value={status}
          onChange={(event) =>
            onStatusChange(
              event.target.value,
            )
          }
          displayEmpty
          sx={{
            height: 42,
            borderRadius: 2,
            bgcolor:
              "background.paper",
          }}
        >
          <MenuItem value="all">
            All
          </MenuItem>

          <MenuItem value="pending">
            Pending
          </MenuItem>

          <MenuItem value="in_progress">
            In Progress
          </MenuItem>

          <MenuItem value="completed">
            Completed
          </MenuItem>

          <MenuItem value="cancelled">
            Cancelled
          </MenuItem>
        </Select>
      </FormControl>

      {false && (
        <Typography>
          Filters
        </Typography>
      )}
    </Stack>
  );
};

export default ProjectFilters;