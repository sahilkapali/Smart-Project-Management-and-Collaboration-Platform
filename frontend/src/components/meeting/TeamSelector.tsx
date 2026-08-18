import React from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Chip,
  TextField,
  Typography,
} from "@mui/material";

import type { Team } from "../../types/team.types";

interface TeamSelectorProps {
  teams: Team[];
  selectedTeams: Team[];
  onChange: (teams: Team[]) => void;
  disabled?: boolean;
  loading?: boolean;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({
  teams,
  selectedTeams,
  onChange,
  disabled = false,
  loading = false,
}) => {
  return (
    <Autocomplete<Team, true, false, false>
      multiple
      options={teams}
      value={selectedTeams}
      onChange={(_, newValue) => {
        onChange(newValue);
      }}
      loading={loading}
      disabled={disabled}

      // Keep dropdown open while selecting multiple teams.
      disableCloseOnSelect

      isOptionEqualToValue={(option, value) =>
        option._id === value._id
      }

      getOptionLabel={(option) => option.name || "Unnamed Team"}

      renderOption={(props, option) => {
        return (
          <Box
            component="li"
            {...props}
            key={option._id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              py: 1,
            }}
          >
            <Avatar sx={{ width: 36, height: 36 }}>
              {option.name?.charAt(0).toUpperCase() || "T"}
            </Avatar>

            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
              >
                {option.name}
              </Typography>

              {option.description && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {option.description}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}

      renderTags={(value, getTagProps) =>
        value.map((team, index) => (
          <Chip
            {...getTagProps({ index })}
            key={team._id}
            avatar={
              <Avatar>
                {team.name?.charAt(0).toUpperCase() || "T"}
              </Avatar>
            }
            label={team.name}
          />
        ))
      }

      renderInput={(params) => (
        <TextField
          {...params}
          label="Teams"
          placeholder="Select teams"
          helperText="Select teams whose members should receive the meeting invitation."
        />
      )}
    />
  );
};

export default TeamSelector;