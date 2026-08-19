import { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";

import * as teamService from "../../services/team.service";

interface AddMemberDialogProps {
  open: boolean;

  teamId: string;

  onClose: () => void;

  onAdded: () => void;
}

const AddMemberDialog = ({
  open,
  teamId,
  onClose,
  onAdded,
}: AddMemberDialogProps) => {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);

      setError("");

      await teamService.addTeamMember(teamId, {
        email,
      });

      setEmail("");

      onAdded();

      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to add member.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Team Member</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          label="Member Email"
          placeholder="example@gmail.com"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !email.trim()}
        >
          {loading ? <CircularProgress size={22} /> : "Add Member"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDialog;
