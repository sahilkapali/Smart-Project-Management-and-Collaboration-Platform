import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import {
  getIssueById,
  updateIssue,
  deleteIssue,
  getIssueComments,
  addIssueComment,
} from "../../services/issues.service";

import type {
  Issue,
  IssueComment,
  IssuePriority,
  IssueStatus,
} from "../../types/issue.types";

const IssueDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // ============================================================
  // STATE
  // ============================================================

  const [issue, setIssue] = useState<Issue | null>(null);

  const [comments, setComments] = useState<IssueComment[]>([]);

  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [savingAssignee, setSavingAssignee] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  const [error, setError] = useState("");

  const [commentText, setCommentText] = useState("");

  const [isEditingAssignee, setIsEditingAssignee] = useState(false);
  const [assigneeInput, setAssigneeInput] = useState("");

  // ============================================================
  // ERROR MESSAGE
  // ============================================================

  const getErrorMessage = (err: any, fallback: string): string => {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      fallback
    );
  };

  // ============================================================
  // GET USER ID
  // ============================================================

  const getUserId = (
    user: Issue["assignedTo"] | Issue["createdBy"],
  ): string => {
    if (!user) {
      return "";
    }

    if (typeof user === "string") {
      return user;
    }

    return user._id || "";
  };

  // ============================================================
  // GET USER NAME
  // ============================================================

  const getUserName = (
    user: Issue["assignedTo"] | Issue["createdBy"],
  ): string => {
    if (!user) {
      return "Unassigned";
    }

    if (typeof user === "string") {
      return user || "Unassigned";
    }

    return user.name || user.email || "User";
  };

  // ============================================================
  // GET REPOSITORY NAME
  // ============================================================

  const getRepositoryName = (repository: Issue["repository"]): string => {
    if (!repository) {
      return "N/A";
    }

    if (typeof repository === "string") {
      return repository || "N/A";
    }

    return repository.name || repository._id || "N/A";
  };

  // ============================================================
  // LOAD ISSUE
  // ============================================================

  const loadIssue = useCallback(async () => {
    if (!id) {
      setError("Issue ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getIssueById(id);

      if (!data) {
        setIssue(null);
        setError("Issue not found.");
        return;
      }

      setIssue(data);
      setAssigneeInput(getUserId(data.assignedTo));
    } catch (err: any) {
      console.error("Failed to load issue:", err);

      setIssue(null);

      setError(getErrorMessage(err, "Failed to load issue."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ============================================================
  // LOAD COMMENTS
  // ============================================================

  const loadComments = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setCommentsLoading(true);

      const data = await getIssueComments(id);

      setComments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load issue comments:", err);

      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    void loadIssue();
    void loadComments();
  }, [loadIssue, loadComments]);

  // ============================================================
  // STATUS COLOR
  // ============================================================

  const getStatusColor = (
    status: IssueStatus,
  ): "error" | "warning" | "success" | "default" => {
    switch (status) {
      case "Open":
        return "error";

      case "In Progress":
        return "warning";

      case "Resolved":
        return "success";

      case "Closed":
        return "default";

      default:
        return "default";
    }
  };

  // ============================================================
  // PRIORITY COLOR
  // ============================================================

  const getPriorityColor = (
    priority: IssuePriority,
  ): "error" | "warning" | "info" | "success" | "default" => {
    switch (priority) {
      case "Critical":
        return "error";

      case "High":
        return "warning";

      case "Medium":
        return "info";

      case "Low":
        return "success";

      default:
        return "default";
    }
  };

  // ============================================================
  // SAVE ASSIGNEE
  // ============================================================

  const handleSaveAssignee = async () => {
    if (!id || !issue) {
      return;
    }

    try {
      setSavingAssignee(true);
      setError("");

      const trimmedAssignee = assigneeInput.trim();

      const updatedIssue = await updateIssue(id, {
        assignedTo: trimmedAssignee || undefined,
      });

      if (!updatedIssue) {
        throw new Error("Server returned an invalid issue.");
      }

      setIssue(updatedIssue);

      setAssigneeInput(getUserId(updatedIssue.assignedTo));

      setIsEditingAssignee(false);
    } catch (err: any) {
      console.error("Failed to update assignee:", err);

      setError(getErrorMessage(err, "Failed to update assignee."));
    } finally {
      setSavingAssignee(false);
    }
  };

  // ============================================================
  // CANCEL ASSIGNEE EDIT
  // ============================================================

  const handleCancelAssigneeEdit = () => {
    if (!issue) {
      return;
    }

    setIsEditingAssignee(false);

    setAssigneeInput(getUserId(issue.assignedTo));
  };

  // ============================================================
  // DELETE ISSUE
  // ============================================================

  const handleDelete = async () => {
    if (!id) {
      setError("Issue ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this issue?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteIssue(id);

      navigate("/issues", {
        replace: true,
      });
    } catch (err: any) {
      console.error("Delete issue failed:", err);

      setError(getErrorMessage(err, "Failed to delete issue."));
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================
  // ADD COMMENT
  // ============================================================

  const handleAddComment = async () => {
    if (!id) {
      setError("Issue ID is missing.");
      return;
    }

    const trimmedComment = commentText.trim();

    if (!trimmedComment) {
      return;
    }

    try {
      setSendingComment(true);
      setError("");

      const comment = await addIssueComment(id, trimmedComment);

      if (comment) {
        setComments((previous) => [...previous, comment]);
      }

      setCommentText("");
    } catch (err: any) {
      console.error("Add comment failed:", err);

      setError(getErrorMessage(err, "Failed to add comment."));
    } finally {
      setSendingComment(false);
    }
  };

  // ============================================================
  // COMMENT KEYBOARD SHORTCUT
  // ============================================================

  const handleCommentKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();

      void handleAddComment();
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: 450,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />

          <Typography color="text.secondary">Loading issue...</Typography>
        </Stack>
      </Box>
    );
  }

  // ============================================================
  // ISSUE NOT FOUND
  // ============================================================

  if (!issue) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        <Alert severity="error">{error || "Issue not found."}</Alert>

        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/issues")}
          sx={{
            mt: 2,
            textTransform: "none",
          }}
        >
          Back to Issues
        </Button>
      </Box>
    );
  }

  // ============================================================
  // DISPLAY VALUES
  // ============================================================

  const repositoryName = getRepositoryName(issue.repository);

  const createdByName = getUserName(issue.createdBy);

  const assignedToName = issue.assignedTo
    ? getUserName(issue.assignedTo)
    : "Unassigned";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        mx: "auto",
        pb: 4,
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
        justifyContent="space-between"
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            onClick={() => navigate("/issues")}
            aria-label="Back to issues"
          >
            <ArrowBackRoundedIcon />
          </IconButton>

          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              fontSize: {
                xs: "1.8rem",
                sm: "2.1rem",
                md: "2.3rem",
              },
            }}
          >
            Issue Details
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {/* EDIT */}

          <Button
            variant="outlined"
            startIcon={<EditRoundedIcon />}
            onClick={() => navigate(`/issues/${id}/edit`)}
            disabled={deleting}
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Edit
          </Button>

          {/* DELETE */}

          <Button
            variant="outlined"
            color="error"
            startIcon={
              deleting ? (
                <CircularProgress size={18} />
              ) : (
                <DeleteOutlineRoundedIcon />
              )
            }
            onClick={() => void handleDelete()}
            disabled={deleting}
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </Stack>
      </Stack>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* ======================================================
          ISSUE CARD
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          <Stack spacing={3}>
            {/* TITLE */}

            <Box>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  wordBreak: "break-word",
                }}
              >
                {issue.title || "Untitled Issue"}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {issue.description || "No description available."}
              </Typography>
            </Box>

            <Divider />

            {/* STATUS + PRIORITY */}

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={issue.status || "Open"}
                color={getStatusColor(issue.status)}
              />

              <Chip
                label={issue.priority || "Medium"}
                color={getPriorityColor(issue.priority)}
              />
            </Stack>

            <Divider />

            {/* ==================================================
                ISSUE DETAILS
            ================================================== */}

            <Stack spacing={2}>
              {/* REPOSITORY */}

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                justifyContent="space-between"
                spacing={1}
              >
                <Typography color="text.secondary">Repository</Typography>

                <Typography
                  fontWeight={600}
                  sx={{
                    wordBreak: "break-word",
                    textAlign: {
                      xs: "left",
                      sm: "right",
                    },
                  }}
                >
                  {repositoryName}
                </Typography>
              </Stack>

              <Divider />

              {/* CREATED BY */}

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                justifyContent="space-between"
                spacing={1}
              >
                <Typography color="text.secondary">Created By</Typography>

                <Typography
                  fontWeight={600}
                  sx={{
                    wordBreak: "break-word",
                  }}
                >
                  {createdByName}
                </Typography>
              </Stack>

              <Divider />

              {/* ASSIGNED TO */}

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                justifyContent="space-between"
                spacing={1}
              >
                <Typography color="text.secondary">Assigned To</Typography>

                {!isEditingAssignee ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      fontWeight={600}
                      sx={{
                        wordBreak: "break-word",
                      }}
                    >
                      {assignedToName}
                    </Typography>

                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setIsEditingAssignee(true);

                        setAssigneeInput(getUserId(issue.assignedTo));
                      }}
                      disabled={savingAssignee || deleting}
                      aria-label="Edit assignee"
                    >
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ) : (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: 420,
                      },
                    }}
                  >
                    <TextField
                      size="small"
                      fullWidth
                      value={assigneeInput}
                      onChange={(event) => setAssigneeInput(event.target.value)}
                      placeholder="Enter user ID"
                      label="User ID"
                      disabled={savingAssignee}
                    />

                    <IconButton
                      color="primary"
                      onClick={() => void handleSaveAssignee()}
                      disabled={savingAssignee}
                      aria-label="Save assignee"
                    >
                      {savingAssignee ? (
                        <CircularProgress size={20} />
                      ) : (
                        <SaveRoundedIcon />
                      )}
                    </IconButton>

                    <IconButton
                      color="inherit"
                      onClick={handleCancelAssigneeEdit}
                      disabled={savingAssignee}
                      aria-label="Cancel assignee edit"
                    >
                      <CloseRoundedIcon />
                    </IconButton>
                  </Stack>
                )}
              </Stack>

              {/* CREATED DATE */}

              {issue.createdAt && (
                <>
                  <Divider />

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography color="text.secondary">Created</Typography>

                    <Typography fontWeight={600}>
                      {new Date(issue.createdAt).toLocaleString()}
                    </Typography>
                  </Stack>
                </>
              )}

              {/* UPDATED DATE */}

              {issue.updatedAt && (
                <>
                  <Divider />

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography color="text.secondary">Last Updated</Typography>

                    <Typography fontWeight={600}>
                      {new Date(issue.updatedAt).toLocaleString()}
                    </Typography>
                  </Stack>
                </>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ======================================================
          COMMENTS
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              mb: 2,
            }}
          >
            Comments
          </Typography>

          {/* COMMENTS */}

          {commentsLoading ? (
            <Box
              sx={{
                py: 3,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={28} />
            </Box>
          ) : comments.length === 0 ? (
            <Typography
              color="text.secondary"
              sx={{
                mb: 3,
              }}
            >
              No comments yet.
            </Typography>
          ) : (
            <Stack
              spacing={2}
              sx={{
                mb: 3,
              }}
            >
              {comments.map((comment, index) => {
                const userName = getUserName(comment.user);

                const commentId =
                  comment._id || comment.id || `${id}-comment-${index}`;

                return (
                  <Box
                    key={commentId}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                    }}
                  >
                    <Stack direction="row" spacing={1.5}>
                      {/* AVATAR */}

                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                        }}
                      >
                        {(userName || "U").charAt(0).toUpperCase()}
                      </Avatar>

                      {/* COMMENT */}

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Typography fontWeight={700}>{userName}</Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.5,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {comment.text}
                        </Typography>

                        {comment.createdAt && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              mt: 0.75,
                            }}
                          >
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}

          <Divider
            sx={{
              mb: 2,
            }}
          />

          {/* ==================================================
              ADD COMMENT
          ================================================== */}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
          >
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={6}
              placeholder="Write a comment..."
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              onKeyDown={handleCommentKeyDown}
              disabled={sendingComment || deleting}
              helperText="Press Ctrl + Enter to send"
            />

            <Button
              variant="contained"
              endIcon={
                sendingComment ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SendRoundedIcon />
                )
              }
              onClick={() => void handleAddComment()}
              disabled={sendingComment || deleting || !commentText.trim()}
              sx={{
                minWidth: 120,
                textTransform: "none",
                borderRadius: 2,
                alignSelf: {
                  xs: "stretch",
                  sm: "center",
                },
              }}
            >
              {sendingComment ? "Sending..." : "Send"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IssueDetailsPage;
