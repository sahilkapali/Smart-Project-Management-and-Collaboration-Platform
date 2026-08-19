import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import type { ReactNode } from "react";

import type { Project } from "../../types/project.types";

import type { Repository } from "../../types/repository.types";

import type { Issue } from "../../types/issue.types";

import type { Meeting } from "../../types/meeting.types";

import type { DashboardTask } from "./TaskList";

/* ============================================================
   DIALOG TYPES
============================================================ */

export type DashboardDialogType =
  | "projects"
  | "tasks"
  | "overdueTasks"
  | "completedTasks"
  | "pendingTasks"
  | "repositories"
  | "issues"
  | "openIssues"
  | "resolvedIssues"
  | "meetings"
  | "project"
  | "task"
  | "repository"
  | "issue"
  | "meeting";

interface DashboardDetailsDialogProps {
  open: boolean;

  type: DashboardDialogType | null;

  title: string;

  projects: Project[];

  tasks: DashboardTask[];

  repositories: Repository[];

  issues: Issue[];

  meetings: Meeting[];

  selectedProject?: Project | null;

  selectedTask?: DashboardTask | null;

  selectedRepository?: Repository | null;

  selectedIssue?: Issue | null;

  selectedMeeting?: Meeting | null;

  onClose: () => void;

  onProjectClick?: (project: Project) => void;

  onTaskClick?: (task: DashboardTask) => void;

  onRepositoryClick?: (
    repository: Repository,
  ) => void;

  onIssueClick?: (
    issue: Issue,
  ) => void;

  onMeetingClick?: (
    meeting: Meeting,
  ) => void;
}

/* ============================================================
   COMPONENT
============================================================ */

const DashboardDetailsDialog = ({
  open,

  type,

  title,

  projects,

  tasks,

  repositories,

  issues,

  meetings,

  selectedProject,

  selectedTask,

  selectedRepository,

  selectedIssue,

  selectedMeeting,

  onClose,

  onProjectClick,

  onTaskClick,

  onRepositoryClick,

  onIssueClick,

  onMeetingClick,
}: DashboardDetailsDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle
        sx={{
          pr: 6,

          fontWeight: 700,
        }}
      >
        {title}

        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{
            position: "absolute",

            right: 12,

            top: 12,
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          p: 0,

          minHeight: 180,
        }}
      >
        {type === "projects" && (
          <ProjectList
            projects={projects}
            onClick={onProjectClick}
          />
        )}

        {type === "tasks" && (
          <TaskList
            tasks={tasks}
            onClick={onTaskClick}
          />
        )}

        {type === "overdueTasks" && (
          <TaskList
            tasks={tasks.filter(
              (task) =>
                Boolean(task.dueDate) &&
                new Date(
                  task.dueDate as string,
                ).getTime() <
                  Date.now() &&
                task.status !== "DONE",
            )}
            onClick={onTaskClick}
          />
        )}

        {type === "completedTasks" && (
          <TaskList
            tasks={tasks.filter(
              (task) =>
                task.status === "DONE",
            )}
            onClick={onTaskClick}
          />
        )}

        {type === "pendingTasks" && (
          <TaskList
            tasks={tasks.filter(
              (task) =>
                task.status === "TODO",
            )}
            onClick={onTaskClick}
          />
        )}

        {type === "repositories" && (
          <RepositoryList
            repositories={repositories}
            onClick={onRepositoryClick}
          />
        )}

        {type === "issues" && (
          <IssueList
            issues={issues}
            onClick={onIssueClick}
          />
        )}

        {type === "openIssues" && (
          <IssueList
            issues={issues.filter(
              (issue) =>
                issue.status ===
                "Open",
            )}
            onClick={onIssueClick}
          />
        )}

        {type === "resolvedIssues" && (
          <IssueList
            issues={issues.filter(
              (issue) =>
                issue.status ===
                  "Resolved" ||
                issue.status ===
                  "Closed",
            )}
            onClick={onIssueClick}
          />
        )}

        {type === "meetings" && (
          <MeetingList
            meetings={meetings}
            onClick={onMeetingClick}
          />
        )}

        {type === "project" &&
          selectedProject && (
            <ProjectDetails
              project={selectedProject}
            />
          )}

        {type === "task" &&
          selectedTask && (
            <TaskDetails
              task={selectedTask}
            />
          )}

        {type === "repository" &&
          selectedRepository && (
            <RepositoryDetails
              repository={
                selectedRepository
              }
            />
          )}

        {type === "issue" &&
          selectedIssue && (
            <IssueDetails
              issue={selectedIssue}
            />
          )}

        {type === "meeting" &&
          selectedMeeting && (
            <MeetingDetails
              meeting={selectedMeeting}
            />
          )}
      </DialogContent>
    </Dialog>
  );
};

/* ============================================================
   PROJECT LIST
============================================================ */

interface ProjectListProps {
  projects: Project[];

  onClick?: (
    project: Project,
  ) => void;
}

const ProjectList = ({
  projects,
  onClick,
}: ProjectListProps) => {
  if (projects.length === 0) {
    return <EmptyState text="No projects available." />;
  }

  return (
    <List disablePadding>
      {projects.map((project) => (
        <ListItem
          key={project.id}
          disablePadding
          divider
        >
          <ListItemButton
            onClick={() =>
              onClick?.(project)
            }
          >
            <Box
              sx={{
                width: 42,

                height: 42,

                borderRadius: 2,

                display: "grid",

                placeItems: "center",

                bgcolor:
                  "action.hover",

                color:
                  "primary.main",

                mr: 1.5,

                flexShrink: 0,
              }}
            >
              <FolderRoundedIcon />
            </Box>

            <ListItemText
              primary={
                <Typography
                  fontWeight={700}
                >
                  {project.name}
                </Typography>
              }
              secondary={
                project.description ||
                "No project description."
              }
            />

            <Chip
              size="small"
              label={project.status}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

/* ============================================================
   TASK LIST
============================================================ */

interface TaskListProps {
  tasks: DashboardTask[];

  onClick?: (
    task: DashboardTask,
  ) => void;
}

const TaskList = ({
  tasks,
  onClick,
}: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <EmptyState text="No tasks available." />
    );
  }

  return (
    <List disablePadding>
      {tasks.map((task) => (
        <ListItem
          key={task.id}
          disablePadding
          divider
        >
          <ListItemButton
            onClick={() =>
              onClick?.(task)
            }
          >
            <Box
              sx={{
                width: 42,

                height: 42,

                borderRadius: 2,

                display: "grid",

                placeItems: "center",

                bgcolor:
                  "action.hover",

                color:
                  "primary.main",

                mr: 1.5,

                flexShrink: 0,
              }}
            >
              <TaskAltRoundedIcon />
            </Box>

            <ListItemText
              primary={
                <Typography
                  fontWeight={700}
                >
                  {task.title}
                </Typography>
              }
              secondary={`${task.projectName} • Due: ${task.deadline}`}
            />

            <Chip
              size="small"
              label={getTaskStatusLabel(
                task.status,
              )}
              color={
                task.status === "DONE"
                  ? "success"
                  : task.status ===
                      "IN_PROGRESS"
                    ? "warning"
                    : "default"
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

/* ============================================================
   REPOSITORY LIST
============================================================ */

interface RepositoryListProps {
  repositories: Repository[];

  onClick?: (
    repository: Repository,
  ) => void;
}

const RepositoryList = ({
  repositories,
  onClick,
}: RepositoryListProps) => {
  if (repositories.length === 0) {
    return (
      <EmptyState text="No repositories available." />
    );
  }

  return (
    <List disablePadding>
      {repositories.map(
        (repository) => (
          <ListItem
            key={repository._id}
            disablePadding
            divider
          >
            <ListItemButton
              onClick={() =>
                onClick?.(
                  repository,
                )
              }
            >
              <Box
                sx={{
                  width: 42,

                  height: 42,

                  borderRadius: 2,

                  display: "grid",

                  placeItems: "center",

                  bgcolor:
                    "action.hover",

                  color:
                    "primary.main",

                  mr: 1.5,
                }}
              >
                <StorageRoundedIcon />
              </Box>

              <ListItemText
                primary={
                  <Typography
                    fontWeight={700}
                  >
                    {repository.name}
                  </Typography>
                }
                secondary={
                  repository.description ||
                  "Repository"
                }
              />
            </ListItemButton>
          </ListItem>
        ),
      )}
    </List>
  );
};

/* ============================================================
   ISSUE LIST
============================================================ */

interface IssueListProps {
  issues: Issue[];

  onClick?: (
    issue: Issue,
  ) => void;
}

const IssueList = ({
  issues,
  onClick,
}: IssueListProps) => {
  if (issues.length === 0) {
    return (
      <EmptyState text="No issues available." />
    );
  }

  return (
    <List disablePadding>
      {issues.map((issue) => (
        <ListItem
          key={issue._id}
          disablePadding
          divider
        >
          <ListItemButton
            onClick={() =>
              onClick?.(issue)
            }
          >
            <Box
              sx={{
                width: 42,

                height: 42,

                borderRadius: 2,

                display: "grid",

                placeItems: "center",

                bgcolor:
                  "action.hover",

                color:
                  "error.main",

                mr: 1.5,
              }}
            >
              <BugReportRoundedIcon />
            </Box>

            <ListItemText
              primary={
                <Typography
                  fontWeight={700}
                >
                  {issue.title}
                </Typography>
              }
              secondary={
                issue.description ||
                "No description."
              }
            />

            <Chip
              size="small"
              label={issue.status}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

/* ============================================================
   MEETING LIST
============================================================ */

interface MeetingListProps {
  meetings: Meeting[];

  onClick?: (
    meeting: Meeting,
  ) => void;
}

const MeetingList = ({
  meetings,
  onClick,
}: MeetingListProps) => {
  if (meetings.length === 0) {
    return (
      <EmptyState text="No meetings available." />
    );
  }

  return (
    <List disablePadding>
      {meetings.map((meeting) => (
        <ListItem
          key={meeting._id}
          disablePadding
          divider
        >
          <ListItemButton
            onClick={() =>
              onClick?.(meeting)
            }
          >
            <Box
              sx={{
                width: 42,

                height: 42,

                borderRadius: 2,

                display: "grid",

                placeItems: "center",

                bgcolor:
                  "action.hover",

                color:
                  "primary.main",

                mr: 1.5,
              }}
            >
              <EventRoundedIcon />
            </Box>

            <ListItemText
              primary={
                <Typography
                  fontWeight={700}
                >
                  {meeting.title}
                </Typography>
              }
              secondary={formatDate(
                meeting.startTime,
              )}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

/* ============================================================
   PROJECT DETAILS
============================================================ */

const ProjectDetails = ({
  project,
}: {
  project: Project;
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <DetailHeader
        icon={
          <FolderRoundedIcon />
        }
        title={project.name}
      />

      <Stack spacing={2} sx={{ mt: 3 }}>
        <DetailRow
          label="Status"
          value={project.status}
        />

        <DetailRow
          label="Progress"
          value={`${project.progress ?? 0}%`}
        />

        <DetailRow
          label="Start Date"
          value={formatDate(
            project.startDate,
          )}
        />

        <DetailRow
          label="End Date"
          value={formatDate(
            project.endDate,
          )}
        />

        <DetailRow
          label="Description"
          value={
            project.description ||
            "No description."
          }
        />
      </Stack>
    </Box>
  );
};

/* ============================================================
   TASK DETAILS
============================================================ */

const TaskDetails = ({
  task,
}: {
  task: DashboardTask;
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <DetailHeader
        icon={
          <TaskAltRoundedIcon />
        }
        title={task.title}
      />

      <Stack spacing={2} sx={{ mt: 3 }}>
        <DetailRow
          label="Project"
          value={task.projectName}
        />

        <DetailRow
          label="Deadline"
          value={task.deadline}
        />

        <DetailRow
          label="Progress"
          value={`${task.progress}%`}
        />

        <DetailRow
          label="Status"
          value={getTaskStatusLabel(
            task.status,
          )}
        />
      </Stack>
    </Box>
  );
};

/* ============================================================
   REPOSITORY DETAILS
============================================================ */

const RepositoryDetails = ({
  repository,
}: {
  repository: Repository;
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <DetailHeader
        icon={
          <StorageRoundedIcon />
        }
        title={repository.name}
      />

      <Stack spacing={2} sx={{ mt: 3 }}>
        <DetailRow
          label="Description"
          value={
            repository.description ||
            "No description."
          }
        />

        <DetailRow
          label="Repository ID"
          value={repository._id}
        />
      </Stack>
    </Box>
  );
};

/* ============================================================
   ISSUE DETAILS
============================================================ */

const IssueDetails = ({
  issue,
}: {
  issue: Issue;
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <DetailHeader
        icon={
          <BugReportRoundedIcon />
        }
        title={issue.title}
      />

      <Stack spacing={2} sx={{ mt: 3 }}>
        <DetailRow
          label="Status"
          value={issue.status}
        />

        <DetailRow
          label="Description"
          value={
            issue.description ||
            "No description."
          }
        />

       <DetailRow
  label="Issue ID"
  value={issue._id ?? ""}
/>
      </Stack>
    </Box>
  );
};

/* ============================================================
   MEETING DETAILS
============================================================ */

const MeetingDetails = ({
  meeting,
}: {
  meeting: Meeting;
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <DetailHeader
        icon={
          <EventRoundedIcon />
        }
        title={meeting.title}
      />

      <Stack spacing={2} sx={{ mt: 3 }}>
        <DetailRow
          label="Start"
          value={formatDate(
            meeting.startTime,
          )}
        />

        <DetailRow
          label="End"
          value={formatDate(
            meeting.endTime,
          )}
        />

        <DetailRow
          label="Description"
          value={
            meeting.description ||
            "No description."
          }
        />
      </Stack>
    </Box>
  );
};

/* ============================================================
   DETAIL HEADER
============================================================ */

const DetailHeader = ({
  icon,
  title,
}: {
  icon: ReactNode;

  title: string;
}) => {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
    >
      <Box
        sx={{
          width: 44,

          height: 44,

          borderRadius: 2,

          display: "grid",

          placeItems: "center",

          bgcolor:
            "primary.main",

          color:
            "primary.contrastText",
        }}
      >
        {icon}
      </Box>

      <Typography
        variant="h6"
        fontWeight={700}
      >
        {title}
      </Typography>
    </Stack>
  );
};

/* ============================================================
   DETAIL ROW
============================================================ */

const DetailRow = ({
  label,
  value,
}: {
  label: string;

  value: string;
}) => {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
      >
        {label}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mt: 0.35,

          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

/* ============================================================
   EMPTY
============================================================ */

const EmptyState = ({
  text,
}: {
  text: string;
}) => {
  return (
    <Box
      sx={{
        minHeight: 220,

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        p: 3,
      }}
    >
      <Typography
        color="text.secondary"
      >
        {text}
      </Typography>
    </Box>
  );
};

/* ============================================================
   HELPERS
============================================================ */

const getTaskStatusLabel = (
  status: DashboardTask["status"],
) => {
  switch (status) {
    case "DONE":
      return "Completed";

    case "IN_PROGRESS":
      return "In Progress";

    default:
      return "To Do";
  }
};

const formatDate = (
  value?: string | null,
) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

export default DashboardDetailsDialog;