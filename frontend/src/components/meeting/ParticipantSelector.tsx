import React from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Chip,
  TextField,
  Typography,
} from "@mui/material";

import type { UserReference } from "../../types/meeting.types";

interface ParticipantSelectorProps {
  users: UserReference[];
  selectedParticipants: UserReference[];
  onChange: (participants: UserReference[]) => void;
  disabled?: boolean;
  loading?: boolean;
}

const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  users,
  selectedParticipants,
  onChange,
  disabled = false,
  loading = false,
}) => {
  return (
    <Autocomplete<UserReference, true, false, false>
      multiple
      options={users}
      value={selectedParticipants}
      onChange={(_, newValue) => {
        onChange(newValue);
      }}
      loading={loading}
      disabled={disabled}
      isOptionEqualToValue={(option, value) =>
        option._id === value._id
      }
      getOptionLabel={(option) => {
        // Always return a string
        const fullName = `${option.firstName ?? ""} ${
          option.lastName ?? ""
        }`.trim();

        if (fullName) {
          return fullName;
        }

        if (option.name) {
          return option.name;
        }

        if (option.email) {
          return option.email;
        }

        return "Unknown User";
      }}
      renderOption={(props, option) => {
        const fullName = `${option.firstName ?? ""} ${
          option.lastName ?? ""
        }`.trim();

        const displayName =
          fullName || option.name || option.email || "Unknown User";

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
              {displayName.charAt(0).toUpperCase()}
            </Avatar>

            <Box>
              <Typography variant="body2" fontWeight={600}>
                {displayName}
              </Typography>

              {option.email && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {option.email}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const fullName = `${option.firstName ?? ""} ${
            option.lastName ?? ""
          }`.trim();

          const displayName =
            fullName || option.name || option.email || "Unknown User";

          return (
            <Chip
              {...getTagProps({ index })}
              key={option._id}
              avatar={
                <Avatar>
                  {displayName.charAt(0).toUpperCase()}
                </Avatar>
              }
              label={displayName}
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Participants"
          placeholder="Select participants"
          helperText="Select the team members who should receive the meeting invitation."
        />
      )}
    />
  );
};

export default ParticipantSelector;