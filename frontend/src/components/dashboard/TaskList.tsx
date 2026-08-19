import {
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export type DashboardTaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "DONE";

export interface DashboardTask {
  id: string;

  title: string;

  projectName: string;

  deadline: string;

  dueDate?: string | null;

  progress: number;

  status: DashboardTaskStatus;
}

interface TaskListProps {
  tasks: DashboardTask[];

  onTaskClick?: (
    task: DashboardTask,
  ) => void;
}

const TaskList = ({
  tasks,
  onTaskClick,
}: TaskListProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,

        border: "1px solid",

        borderColor: "divider",

        overflow: "hidden",

        height: "100%",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          px: 2,

          pt: 2,

          pb: 1.5,
        }}
      >
        My Tasks List
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  color:
                    "text.secondary",

                  fontSize: 12,

                  fontWeight: 600,
                }}
              >
                Task Name
              </TableCell>

              <TableCell
                sx={{
                  color:
                    "text.secondary",

                  fontSize: 12,

                  fontWeight: 600,
                }}
              >
                Project
              </TableCell>

              <TableCell
                sx={{
                  color:
                    "text.secondary",

                  fontSize: 12,

                  fontWeight: 600,
                }}
              >
                Deadline
              </TableCell>

              <TableCell
                sx={{
                  color:
                    "text.secondary",

                  fontSize: 12,

                  fontWeight: 600,
                }}
              >
                Status
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                hover
                onClick={() =>
                  onTaskClick?.(
                    task,
                  )
                }
                sx={{
                  cursor:
                    onTaskClick
                      ? "pointer"
                      : "default",
                }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                  >
                    {task.title}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {
                      task.projectName
                    }
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                  >
                    {
                      task.deadline
                    }
                  </Typography>
                </TableCell>

                <TableCell>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      minWidth: 140,
                    }}
                  >
                    <LinearProgress
                      variant="determinate"
                      value={
                        task.progress
                      }
                      sx={{
                        width: 52,

                        height: 5,

                        borderRadius: 10,
                      }}
                    />

                    <Chip
                      size="small"
                      label={getStatusLabel(
                        task.status,
                      )}
                      color={getStatusColor(
                        task.status,
                      )}
                      sx={{
                        height: 24,

                        fontSize: 11,
                      }}
                    />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {tasks.length ===
              0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                >
                  <Typography
                    color="text.secondary"
                    sx={{
                      py: 6,
                    }}
                  >
                    No tasks available.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

const getStatusLabel = (
  status: DashboardTaskStatus,
) => {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";

    case "DONE":
      return "Done";

    default:
      return "To Do";
  }
};

const getStatusColor = (
  status: DashboardTaskStatus,
) => {
  switch (status) {
    case "IN_PROGRESS":
      return "warning";

    case "DONE":
      return "success";

    default:
      return "default";
  }
};

export default TaskList;