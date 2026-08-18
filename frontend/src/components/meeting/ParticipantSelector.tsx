import {
  Autocomplete,
  Avatar,
  Box,
  Chip,
  TextField,
  Typography,
} from "@mui/material";

import type { MeetingUser } from "../../types/meeting.types";

interface ParticipantSelectorProps {
  users: MeetingUser[];
  selectedParticipants: MeetingUser[];
  onChange: (users: MeetingUser[]) => void;
}

const getUserName = (user: MeetingUser): string => {
  if (user.name?.trim()) {
    return user.name;
  }

  if (user.email?.trim()) {
    return user.email;
  }

  return "Unknown User";
};

const ParticipantSelector = ({
  users,
  selectedParticipants,
  onChange,
}: ParticipantSelectorProps) => {
  return (
    <Autocomplete
      multiple
      options={users}
      value={selectedParticipants}
      onChange={(_, newValue) => {
        onChange(newValue);
      }}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => getUserName(option)}
      filterSelectedOptions
      fullWidth
      renderTags={(selected, getTagProps) =>
        selected.map((user, index) => {
          const name = getUserName(user);

          return (
            <Chip
              {...getTagProps({ index })}
              key={user.id}
              avatar={
                <Avatar src={user.avatar} alt={name}>
                  {name.charAt(0).toUpperCase()}
                </Avatar>
              }
              label={name}
            />
          );
        })
      }
      renderOption={(props, user) => {
        const name = getUserName(user);

        return (
          <Box
            component="li"
            {...props}
            key={user.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Avatar
              src={user.avatar}
              alt={name}
              sx={{
                width: 36,
                height: 36,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </Avatar>

            <Box>
              <Typography variant="body2" fontWeight={600}>
                {name}
              </Typography>

              {user.email && (
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              )}

              {user.role && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                  }}
                >
                  {user.role}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Participants"
          placeholder={
            selectedParticipants.length === 0
              ? "Select participants"
              : "Add participant"
          }
        />
      )}
    />
  );
};

export default ParticipantSelector;
