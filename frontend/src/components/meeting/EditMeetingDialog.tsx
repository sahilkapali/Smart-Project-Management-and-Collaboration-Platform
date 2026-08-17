import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

import ParticipantSelector from "./ParticipantSelector";

import meetingService from "../../services/meeting.service";
import api from "../../services/api";


import type {
  Meeting,
  UpdateMeetingData,
  UserReference,
} from "../../types/meeting.types";

interface EditMeetingDialogProps {
  open: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  onSaved: (meeting: Meeting) => void;
}

/**
 * Convert ISO date to:
 *
 * YYYY-MM-DDTHH:mm
 *
 * required by datetime-local.
 */
const toDateTimeLocal = (
  value?: string,
): string => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number: number) =>
    String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1,
  )}-${pad(
    date.getDate(),
  )}T${pad(
    date.getHours(),
  )}:${pad(
    date.getMinutes(),
  )}`;
};

/**
 * Safely get user ID.
 */
const getUserId = (
  user: UserReference | string,
): string => {
  if (typeof user === "string") {
    return user;
  }

  return user._id;
};

const EditMeetingDialog = ({
  open,
  meeting,
  onClose,
  onSaved,
}: EditMeetingDialogProps) => {
  // ============================================================
  // FORM STATE
  // ============================================================

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [meetingLink, setMeetingLink] =
    useState("");

  const [participants, setParticipants] =
    useState<string[]>([]);

  const [startTime, setStartTime] =
    useState("");

  // ============================================================
  // USERS
  // ============================================================

  const [users, setUsers] =
    useState<UserReference[]>([]);

  // ============================================================
  // LOADING / ERROR
  // ============================================================

  const [loading, setLoading] =
    useState(false);

  const [loadingUsers, setLoadingUsers] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================================
  // INITIALIZE FORM
  // ============================================================

  useEffect(() => {
    if (!meeting || !open) {
      return;
    }

    setTitle(
      meeting.title || "",
    );

    setDescription(
      meeting.description || "",
    );

    setMeetingLink(
      meeting.meetingLink || "",
    );

    setParticipants(
      (meeting.participants || []).map(
        getUserId,
      ),
    );

    setStartTime(
      toDateTimeLocal(
        meeting.startTime,
      ),
    );

    setError("");
  }, [meeting, open]);

  // ============================================================
  // LOAD USERS
  // ============================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setError("");

        const response =
          await api.get("/users");

        const responseData =
          response.data;

        const userData =
          Array.isArray(responseData)
            ? responseData
            : Array.isArray(
                responseData?.data,
              )
              ? responseData.data
              : Array.isArray(
                  responseData?.users,
                )
                ? responseData.users
                : [];

        setUsers(
          userData,
        );
      } catch (err: any) {
        console.error(
          "Failed to load users:",
          err,
        );

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to load participants.",
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    void loadUsers();
  }, [open]);

  // ============================================================
  // SELECTED USERS
  // ============================================================

  const selectedUsers =
    useMemo(() => {
      return users.filter(
        (user) =>
          participants.includes(
            user._id,
          ),
      );
    }, [
      users,
      participants,
    ]);

  // ============================================================
  // VALIDATION
  // ============================================================

  const validate =
    (): boolean => {
      if (!title.trim()) {
        setError(
          "Meeting title is required.",
        );

        return false;
      }

      if (!startTime) {
        setError(
          "Meeting date and time are required.",
        );

        return false;
      }

      const start =
        new Date(startTime);

      if (
        Number.isNaN(
          start.getTime(),
        )
      ) {
        setError(
          "Please enter a valid meeting date and time.",
        );

        return false;
      }

      if (meetingLink.trim()) {
        try {
          new URL(
            meetingLink.trim(),
          );
        } catch {
          setError(
            "Please enter a valid meeting URL.",
          );

          return false;
        }
      }

      return true;
    };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSave =
    async () => {
      if (!meeting?._id) {
        setError(
          "Meeting ID is missing.",
        );

        return;
      }

      setError("");

      if (!validate()) {
        return;
      }

      try {
        setLoading(true);

        /*
         * IMPORTANT:
         *
         * We are NOT sending projectId.
         *
         * This means the user does not have to
         * choose a project when editing.
         *
         * The existing projectId remains unchanged.
         */

        const data: UpdateMeetingData =
          {
            title:
              title.trim(),

            description:
              description.trim(),

            meetingLink:
              meetingLink.trim(),

            participants:
              participants,

            startTime:
              new Date(
                startTime,
              ).toISOString(),
          };

        const response =
          await meetingService.updateMeeting(
            meeting._id,
            data,
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Meeting update failed.",
          );
        }

        /*
         * Send updated meeting back
         * to MeetingListPage.
         */

        onSaved(
          response.data,
        );

        onClose();
      } catch (err: any) {
        console.error(
          "Failed to update meeting:",
          err,
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.response?.data
              ?.error ||
            err?.message ||
            "Unable to update meeting.",
        );
      } finally {
        setLoading(false);
      }
    };

  // ============================================================
  // CLOSE
  // ============================================================

  const handleClose =
    () => {
      if (loading) {
        return;
      }

      setError("");

      onClose();
    };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
    >
      {/* ====================================================== */}
      {/* TITLE                                                  */}
      {/* ====================================================== */}

      <DialogTitle
        sx={{
          fontWeight: 800,
          fontSize: "1.5rem",
          pb: 1,
        }}
      >
        Edit Meeting
      </DialogTitle>

      <Divider />

      {/* ====================================================== */}
      {/* CONTENT                                                */}
      {/* ====================================================== */}

      <DialogContent
        sx={{
          pt: 3,
        }}
      >
        <Stack spacing={2.5}>

          {/* ERROR */}

          {error && (
            <Alert
              severity="error"
              onClose={() =>
                setError("")
              }
            >
              {error}
            </Alert>
          )}

          {/* ================================================== */}
          {/* MEETING TITLE                                      */}
          {/* ================================================== */}

          <TextField
            label="Meeting title"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value,
              )
            }
            required
            fullWidth
            disabled={loading}
          />

          {/* ================================================== */}
          {/* DESCRIPTION                                        */}
          {/* ================================================== */}

          <TextField
            label="Description"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            multiline
            minRows={3}
            fullWidth
            disabled={loading}
          />

          {/* ================================================== */}
          {/* PARTICIPANTS                                       */}
          {/* ================================================== */}

          <ParticipantSelector
            users={users}
            selectedParticipants={
              selectedUsers
            }
            onChange={(
              selected,
            ) => {
              setParticipants(
                selected.map(
                  (user) =>
                    user._id,
                ),
              );
            }}
            disabled={
              loading ||
              loadingUsers
            }
            loading={
              loadingUsers
            }
          />

          {/* ================================================== */}
          {/* DATE AND TIME                                      */}
          {/* ================================================== */}

          <TextField
            label="Date and time"
            type="datetime-local"
            value={startTime}
            onChange={(event) =>
              setStartTime(
                event.target.value,
              )
            }
            fullWidth
            required
            disabled={loading}
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* ================================================== */}
          {/* MEETING LINK                                       */}
          {/* ================================================== */}

          <TextField
            label="Meeting link"
            value={meetingLink}
            onChange={(event) =>
              setMeetingLink(
                event.target.value,
              )
            }
            placeholder="https://meet.google.com/..."
            fullWidth
            disabled={loading}
          />

        </Stack>
      </DialogContent>

      {/* ====================================================== */}
      {/* ACTIONS                                                */}
      {/* ====================================================== */}

      <Divider />

      <DialogActions
        sx={{
          p: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={
            handleClose
          }
          startIcon={
            <CloseIcon />
          }
          disabled={loading}
          sx={{
            textTransform:
              "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={() =>
            void handleSave()
          }
          startIcon={
            loading ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              <SaveIcon />
            )
          }
          disabled={
            loading ||
            loadingUsers
          }
          sx={{
            textTransform:
              "none",
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
          }}
        >
          {loading
            ? "Saving..."
            : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMeetingDialog;