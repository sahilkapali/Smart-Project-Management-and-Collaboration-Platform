import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  CalendarMonth,
  OpenInNew,
  People,
} from "@mui/icons-material";

import type { Meeting } from "../../types/meeting.types";

interface MeetingCardProps {
  meeting: Meeting;
  onView: (meeting: Meeting) => void;
}

const getUserName = (user: any): string => {
  if (!user) {
    return "Unknown User";
  }

  if (typeof user === "string") {
    return user;
  }

  if (user.name) {
    return user.name;
  }

  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";

  const fullName =
    `${firstName} ${lastName}`.trim();

  return (
    fullName ||
    user.email ||
    "Unknown User"
  );
};

const MeetingCard = ({
  meeting,
  onView,
}: MeetingCardProps) => {
  const startTime = new Date(
    meeting.startTime,
  );

  const endTime = meeting.endTime
    ? new Date(meeting.endTime)
    : null;

  const formattedDate =
    startTime.toLocaleDateString(
      undefined,
      {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );

  const formattedStart =
    startTime.toLocaleTimeString(
      undefined,
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );

  const formattedEnd = endTime
    ? endTime.toLocaleTimeString(
        undefined,
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      )
    : null;

  const creatorName =
    getUserName(meeting.createdBy);

  const participants =
    meeting.participants ?? [];

  const handleView = () => {
    /*
     * Never navigate with an undefined ID.
     */

    if (!meeting._id) {
      console.error(
        "Meeting ID is missing:",
        meeting,
      );

      return;
    }

    onView(meeting);
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform:
            "translateY(-3px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent
        sx={{
          p: 3,
          flex: 1,
        }}
      >
        {/* ===================================================
            TITLE
        =================================================== */}

        <Stack
          spacing={1.5}
        >
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              wordBreak: "break-word",
            }}
          >
            {meeting.title}
          </Typography>

          {meeting.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display:
                  "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient:
                  "vertical",
                overflow: "hidden",
              }}
            >
              {meeting.description}
            </Typography>
          )}
        </Stack>

        <Divider
          sx={{ my: 2 }}
        />

        {/* ===================================================
            DATE / TIME
        =================================================== */}

        <Stack spacing={1.5}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <CalendarMonth
              fontSize="small"
              color="primary"
            />

            <Typography
              variant="body2"
              fontWeight={600}
            >
              {formattedDate}
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ pl: 3.5 }}
          >
            {formattedStart}

            {formattedEnd &&
              ` – ${formattedEnd}`}
          </Typography>
        </Stack>

        {/* ===================================================
            PARTICIPANTS
        =================================================== */}

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mt: 2 }}
        >
          <People
            fontSize="small"
            color="action"
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {participants.length}{" "}
            participant
            {participants.length !== 1
              ? "s"
              : ""}
          </Typography>
        </Stack>

        {participants.length > 0 && (
          <AvatarGroup
            max={5}
            sx={{
              justifyContent:
                "flex-start",
              mt: 1.5,
            }}
          >
            {participants.map(
              (participant, index) => {
                const name =
                  getUserName(
                    participant,
                  );

                return (
                  <Avatar
                    key={
                      typeof participant ===
                      "string"
                        ? participant
                        : participant?._id ??
                          index
                    }
                    alt={name}
                    src={
                      typeof participant !==
                        "string"
                        ? participant?.avatar
                        : undefined
                    }
                  >
                    {name
                      .charAt(0)
                      .toUpperCase()}
                  </Avatar>
                );
              },
            )}
          </AvatarGroup>
        )}

        {/* ===================================================
            CREATOR
        =================================================== */}

        <Box sx={{ mt: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Created by
          </Typography>

          <Typography
            variant="body2"
            fontWeight={600}
          >
            {creatorName}
          </Typography>
        </Box>
      </CardContent>

      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<OpenInNew />}
          onClick={handleView}
          disabled={!meeting._id}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          View Meeting
        </Button>

        {meeting.meetingLink && (
          <Button
            fullWidth
            variant="outlined"
            component="a"
            href={meeting.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              mt: 1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Join Meeting
          </Button>
        )}

        <Chip
          size="small"
          label="Meeting"
          sx={{
            mt: 1.5,
          }}
        />
      </Box>
    </Card>
  );
};

export default MeetingCard;