import type { FC } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Stack,
  Avatar,
  Box,
} from "@mui/material";
import {
  CalendarMonth,
  AccessTime,
  VideoCall,
  Person,
  Visibility,
} from "@mui/icons-material";

import type { Meeting } from "../../types/meeting.types";

interface MeetingCardProps {
  meeting: Meeting;
  onView: (meeting: Meeting) => void;
}

const MeetingCard: FC<MeetingCardProps> = ({
  meeting,
  onView,
}) => {
  const startDate = new Date(meeting.startTime);

  const formattedDate = startDate.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const formattedTime = startDate.toLocaleTimeString(
    undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const participantCount =
    meeting.participants?.length ?? 0;

  const creatorName =
    typeof meeting.createdBy === "object" &&
    meeting.createdBy
      ? `${meeting.createdBy.firstName ?? ""} ${
          meeting.createdBy.lastName ?? ""
        }`.trim() ||
        meeting.createdBy.email ||
        "Unknown"
      : "Unknown";

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: 4,
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                wordBreak: "break-word",
              }}
            >
              {meeting.title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Created by {creatorName}
            </Typography>
          </Box>

          <Chip
            label="Meeting"
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>

        {/* Description */}
        {meeting.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {meeting.description}
          </Typography>
        )}

        {/* Meeting information */}
        <Stack spacing={1.5} sx={{ mt: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CalendarMonth
              fontSize="small"
              color="primary"
            />

            <Typography variant="body2">
              {formattedDate}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <AccessTime
              fontSize="small"
              color="primary"
            />

            <Typography variant="body2">
              {formattedTime}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Person
              fontSize="small"
              color="primary"
            />

            <Typography variant="body2">
              {participantCount} participant
              {participantCount !== 1 ? "s" : ""}
            </Typography>
          </Stack>

          {meeting.meetingLink && (
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <VideoCall
                fontSize="small"
                color="primary"
              />

              <Typography
                variant="body2"
                color="primary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Online meeting
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Participant avatars */}
        {meeting.participants &&
          meeting.participants.length > 0 && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mt: 3 }}
            >
              <Stack direction="row">
                {meeting.participants
                  .slice(0, 4)
                  .map((participant, index) => {
                    const name =
                      typeof participant === "object"
                        ? `${participant.firstName ?? ""} ${
                            participant.lastName ?? ""
                          }`.trim()
                        : "User";

                    return (
                      <Avatar
                        key={
                          typeof participant === "string"
                            ? participant
                            : participant._id ?? index
                        }
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: 13,
                          ml: index === 0 ? 0 : -1,
                          border: "2px solid white",
                          bgcolor:
                            "primary.main",
                        }}
                      >
                        {name
                          ? name.charAt(0).toUpperCase()
                          : "U"}
                      </Avatar>
                    );
                  })}
              </Stack>

              {meeting.participants.length > 4 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  +{meeting.participants.length - 4} more
                </Typography>
              )}
            </Stack>
          )}
      </CardContent>

      <CardActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          startIcon={<Visibility />}
          onClick={() => onView(meeting)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          View Meeting
        </Button>
      </CardActions>
    </Card>
  );
};

export default MeetingCard;