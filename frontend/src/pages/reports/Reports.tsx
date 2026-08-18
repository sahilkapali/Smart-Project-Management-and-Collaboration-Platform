import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import {
  AssignmentRounded,
  CheckCircleRounded,
  ErrorRounded,
  FolderRounded,
  GroupsRounded,
  RefreshRounded,
  TaskAltRounded,
} from "@mui/icons-material";

import projectService from "../../services/project.service";
import { getProjectReport } from "../../services/report.service";

import type { ProjectReport } from "../../types/report.types";
import type { Project } from "../../types/project.types";

// =====================================================
// HELPERS
// =====================================================

const getProjectId = (project: Project): string => {
  return project.id;
};

const formatDate = (value?: string | Date): string => {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (value?: string | Date): string => {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getFullName = (firstName?: string, lastName?: string): string => {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
};

// =====================================================
// STAT CARD
// =====================================================

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  variant: "primary" | "success" | "warning" | "error" | "info";
}

const StatCard = ({ title, value, subtitle, icon, variant }: StatCardProps) => {
  const variantStyles = {
    primary: {
      background: "primary.main",
      color: "primary.contrastText",
    },
    success: {
      background: "success.main",
      color: "success.contrastText",
    },
    warning: {
      background: "warning.main",
      color: "warning.contrastText",
    },
    error: {
      background: "error.main",
      color: "error.contrastText",
    },
    info: {
      background: "info.main",
      color: "info.contrastText",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {title}
            </Typography>

            <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
              {value}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: styles.background,
              color: styles.color,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// =====================================================
// STAT ROW
// =====================================================

interface StatRowProps {
  label: string;
  value: number;
  total: number;
  variant: "success" | "warning" | "error" | "info";
}

const StatRow = ({ label, value, total, variant }: StatRowProps) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  const colorMap = {
    success: "success.main",
    warning: "warning.main",
    error: "error.main",
    info: "info.main",
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>

        <Typography variant="body2" fontWeight={700}>
          {value} ({percentage}%)
        </Typography>
      </Stack>

      <Box
        sx={{
          height: 8,
          bgcolor: "action.hover",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${percentage}%`,
            height: "100%",
            bgcolor: colorMap[variant],
            borderRadius: 10,
            transition: "width 0.3s ease",
          }}
        />
      </Box>
    </Box>
  );
};

// =====================================================
// INFO CARD
// =====================================================

interface InfoCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  description: string;
}

const InfoCard = ({ title, icon, value, description }: InfoCardProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>
      </Stack>

      <Typography variant="h5" fontWeight={800} sx={{ mt: 2 }}>
        {value}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {description}
      </Typography>
    </Paper>
  );
};

// =====================================================
// REPORTS PAGE
// =====================================================

const Reports = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const [report, setReport] = useState<ProjectReport | null>(null);

  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);

  const [loadingReport, setLoadingReport] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  // ===================================================
  // LOAD PROJECTS
  // ===================================================

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        setError("");

        const data = await projectService.getProjects();

        setProjects(data);

        if (data.length > 0) {
          setSelectedProjectId(getProjectId(data[0]));
        }
      } catch (err: unknown) {
        console.error("Failed to load projects:", err);

        const errorMessage =
          err instanceof Error ? err.message : "Unable to load projects.";

        setError(errorMessage);
      } finally {
        setLoadingProjects(false);
      }
    };

    void loadProjects();
  }, []);

  // ===================================================
  // LOAD REPORT
  // ===================================================

  useEffect(() => {
    if (!selectedProjectId) {
      setReport(null);
      return;
    }

    const loadReport = async () => {
      try {
        setLoadingReport(true);
        setError("");

        const data = await getProjectReport(selectedProjectId);

        setReport(data);
      } catch (err: unknown) {
        console.error("Failed to load project report:", err);

        const errorMessage =
          err instanceof Error ? err.message : "Unable to load project report.";

        setError(errorMessage);
        setReport(null);
      } finally {
        setLoadingReport(false);
      }
    };

    void loadReport();
  }, [selectedProjectId]);

  // ===================================================
  // REFRESH REPORT
  // ===================================================

  const refreshReport = async () => {
    if (!selectedProjectId) {
      return;
    }

    try {
      setLoadingReport(true);
      setError("");

      const data = await getProjectReport(selectedProjectId);

      setReport(data);
    } catch (err: unknown) {
      console.error("Failed to refresh report:", err);

      const errorMessage =
        err instanceof Error ? err.message : "Unable to refresh report.";

      setError(errorMessage);
    } finally {
      setLoadingReport(false);
    }
  };

  // ===================================================
  // TASK COMPLETION
  // ===================================================

  const taskCompletionPercentage = useMemo(() => {
    if (!report) {
      return 0;
    }

    if (report.taskStats.total === 0) {
      return 0;
    }

    return Math.round(
      (report.taskStats.completed / report.taskStats.total) * 100,
    );
  }, [report]);

  // ===================================================
  // ISSUE RESOLUTION
  // ===================================================

  const issueResolutionPercentage = useMemo(() => {
    if (!report) {
      return 0;
    }

    if (report.issueStats.total === 0) {
      return 0;
    }

    return Math.round(
      (report.issueStats.resolved / report.issueStats.total) * 100,
    );
  }, [report]);

  // ===================================================
  // PROJECT LOADING
  // ===================================================

  if (loadingProjects) {
    return (
      <Box
        sx={{
          minHeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />

          <Typography color="text.secondary">Loading projects...</Typography>
        </Stack>
      </Box>
    );
  }

  // ===================================================
  // MAIN PAGE
  // ===================================================

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1500,
        mx: "auto",
        px: {
          xs: 1,
          sm: 2,
          md: 3,
        },
        py: {
          xs: 2,
          md: 3,
        },
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          md: "center",
        }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AssignmentRounded
              color="primary"
              sx={{
                fontSize: 34,
              }}
            />

            <Typography variant="h4" fontWeight={800}>
              Reports
            </Typography>
          </Stack>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            View project performance, task progress, and issue statistics.
          </Typography>
        </Box>

        {/* PROJECT SELECTOR */}

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1.5}
          sx={{
            width: {
              xs: "100%",
              md: "auto",
            },
          }}
        >
          <FormControl
            size="small"
            sx={{
              minWidth: {
                xs: "100%",
                sm: 260,
              },
            }}
          >
            <InputLabel>Select Project</InputLabel>

            <Select
              value={selectedProjectId}
              label="Select Project"
              onChange={(event) => {
                setSelectedProjectId(event.target.value);
              }}
            >
              {projects.map((project) => (
                <MenuItem
                  key={getProjectId(project)}
                  value={getProjectId(project)}
                >
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={() => void refreshReport()}
            disabled={loadingReport || !selectedProjectId}
            startIcon={
              loadingReport ? (
                <CircularProgress size={17} />
              ) : (
                <RefreshRounded />
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {/* =================================================
          NO PROJECTS
      ================================================= */}

      {projects.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <FolderRounded
            sx={{
              fontSize: 60,
              color: "text.disabled",
            }}
          />

          <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
            No projects available
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Create or join a project to generate a report.
          </Typography>
        </Paper>
      )}

      {/* =================================================
          REPORT LOADING
      ================================================= */}

      {loadingReport && (
        <Box
          sx={{
            minHeight: 450,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />

            <Typography color="text.secondary">
              Generating project report...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* =================================================
          REPORT
      ================================================= */}

      {!loadingReport && report && (
        <Stack spacing={3}>
          {/* =================================================
              PROJECT INFORMATION
          ================================================= */}

          <Paper
            elevation={0}
            sx={{
              p: {
                xs: 2,
                md: 3,
              },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  {report.project.name}
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  {report.project.description ||
                    "No project description available."}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Project Status
                </Typography>

                <Typography fontWeight={800} sx={{ mt: 0.5 }}>
                  {report.project.status}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            {/* CSS GRID INSTEAD OF MUI GRID */}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Start Date
                </Typography>

                <Typography fontWeight={700}>
                  {formatDate(report.project.startDate)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Due Date
                </Typography>

                <Typography fontWeight={700}>
                  {formatDate(report.project.dueDate)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Members
                </Typography>

                <Typography fontWeight={700}>
                  {report.project.membersCount}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Repositories
                </Typography>

                <Typography fontWeight={700}>
                  {report.repositoriesCount}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            <StatCard
              title="Total Tasks"
              value={report.taskStats.total}
              subtitle="Tasks in project"
              icon={<TaskAltRounded />}
              variant="primary"
            />

            <StatCard
              title="Completed Tasks"
              value={report.taskStats.completed}
              subtitle={`${taskCompletionPercentage}% completion`}
              icon={<CheckCircleRounded />}
              variant="success"
            />

            <StatCard
              title="Total Issues"
              value={report.issueStats.total}
              subtitle="Issues reported"
              icon={<ErrorRounded />}
              variant="error"
            />

            <StatCard
              title="Resolved Issues"
              value={report.issueStats.resolved}
              subtitle={`${issueResolutionPercentage}% resolved`}
              icon={<CheckCircleRounded />}
              variant="success"
            />
          </Box>

          {/* =================================================
              TASK + ISSUE REPORT
          ================================================= */}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
              },
              gap: 3,
            }}
          >
            {/* TASK REPORT */}

            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6" fontWeight={800}>
                  Task Statistics
                </Typography>

                <TaskAltRounded color="primary" />
              </Stack>

              <Divider />

              <Stack spacing={2} sx={{ mt: 2 }}>
                <StatRow
                  label="Completed"
                  value={report.taskStats.completed}
                  total={report.taskStats.total}
                  variant="success"
                />

                <StatRow
                  label="In Progress"
                  value={report.taskStats.inProgress}
                  total={report.taskStats.total}
                  variant="warning"
                />

                <StatRow
                  label="Todo"
                  value={report.taskStats.todo}
                  total={report.taskStats.total}
                  variant="info"
                />
              </Stack>
            </Paper>

            {/* ISSUE REPORT */}

            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6" fontWeight={800}>
                  Issue Statistics
                </Typography>

                <ErrorRounded color="error" />
              </Stack>

              <Divider />

              <Stack spacing={2} sx={{ mt: 2 }}>
                <StatRow
                  label="Open"
                  value={report.issueStats.open}
                  total={report.issueStats.total}
                  variant="error"
                />

                <StatRow
                  label="In Progress"
                  value={report.issueStats.inProgress}
                  total={report.issueStats.total}
                  variant="warning"
                />

                <StatRow
                  label="Resolved"
                  value={report.issueStats.resolved}
                  total={report.issueStats.total}
                  variant="success"
                />
              </Stack>
            </Paper>
          </Box>

          {/* =================================================
              PEOPLE / REPOSITORY
          ================================================= */}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            <InfoCard
              title="Team"
              icon={<GroupsRounded />}
              value={report.project.team?.name || "No team"}
              description={
                report.project.team?.description ||
                "No team description available."
              }
            />

            <InfoCard
              title="Project Members"
              icon={<GroupsRounded />}
              value={`${report.project.membersCount}`}
              description="Members assigned to this project."
            />

            <InfoCard
              title="Repositories"
              icon={<FolderRounded />}
              value={`${report.repositoriesCount}`}
              description="Repositories associated with this project."
            />
          </Box>

          {/* =================================================
              CREATOR
          ================================================= */}

          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" fontWeight={800}>
              Project Creator
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography fontWeight={700}>
              {getFullName(
                report.project.createdBy?.firstName,
                report.project.createdBy?.lastName,
              ) || "Unknown"}
            </Typography>

            {report.project.createdBy?.email && (
              <Typography color="text.secondary">
                {report.project.createdBy.email}
              </Typography>
            )}

            {report.project.createdBy?.role && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Role: {report.project.createdBy.role}
              </Typography>
            )}
          </Paper>

          {/* =================================================
              GENERATED TIME
          ================================================= */}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              textAlign: "right",
            }}
          >
            Report generated: {formatDateTime(report.generatedAt)}
          </Typography>
        </Stack>
      )}
    </Box>
  );
};

export default Reports;
