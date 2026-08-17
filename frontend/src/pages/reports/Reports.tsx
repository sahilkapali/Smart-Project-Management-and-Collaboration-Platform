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
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import toast from "react-hot-toast";

import api from "../../services/api";

// ============================================================
// TYPES
// ============================================================

interface ReportProject {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  description?: string;
  createdBy?: unknown;
  membersCount?: number;
}

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
}

interface IssueStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

interface ProjectReport {
  project: ReportProject;
  repositoriesCount: number;
  taskStats: TaskStats;
  issueStats: IssueStats;
  generatedAt: string;
}

interface ProjectListItem {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
}

interface ProjectsApiResponse {
  success?: boolean;
  message?: string;
  data?: ProjectListItem[];
}

// ============================================================
// REPORTS PAGE
// ============================================================

const Reports = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [report, setReport] = useState<ProjectReport | null>(null);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD PROJECTS
  // ==========================================================

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      setError("");

      /**
       * We intentionally use api directly here.
       *
       * GET /api/projects
       */
      const response = await api.get<ProjectListItem[] | ProjectsApiResponse>(
        "/projects",
      );

      console.log("Projects API response:", response.data);

      let projectList: ProjectListItem[] = [];

      // ------------------------------------------------------
      // Backend returns:
      // [ project1, project2, ... ]
      // ------------------------------------------------------

      if (Array.isArray(response.data)) {
        projectList = response.data;
      }

      // ------------------------------------------------------
      // Backend returns:
      // { success: true, data: [...] }
      // ------------------------------------------------------
      else if (
        response.data &&
        typeof response.data === "object" &&
        Array.isArray(response.data.data)
      ) {
        projectList = response.data.data;
      }

      setProjects(projectList);

      // ------------------------------------------------------
      // Automatically select first project
      // ------------------------------------------------------

      if (projectList.length > 0) {
        const firstProject = projectList[0];

        const firstProjectId = firstProject.id || firstProject._id || "";

        if (firstProjectId) {
          setSelectedProjectId(firstProjectId);
        }
      } else {
        setSelectedProjectId("");
        setReport(null);
      }
    } catch (err: any) {
      console.error("Failed to load projects:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load projects.";

      setProjects([]);
      setReport(null);
      setError(message);

      toast.error(message);
    } finally {
      setLoadingProjects(false);
    }
  };

  // ==========================================================
  // LOAD PROJECT REPORT
  // ==========================================================

  const loadReport = async (projectId: string) => {
    if (!projectId) {
      setReport(null);
      return;
    }

    try {
      setLoadingReport(true);
      setError("");

      /**
       * Backend route:
       *
       * GET /api/reports/project/:projectId
       */
      const response = await api.get<{
        success: boolean;
        message: string;
        data: ProjectReport;
      }>(`/reports/project/${projectId}`);

      console.log("Project report response:", response.data);

      if (!response.data?.data) {
        throw new Error("Report data was not returned by the server.");
      }

      setReport(response.data.data);
    } catch (err: any) {
      console.error("Failed to generate project report:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to generate project report.";

      setReport(null);
      setError(message);

      toast.error(message);
    } finally {
      setLoadingReport(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadProjects();
  }, []);

  // ==========================================================
  // LOAD REPORT WHEN PROJECT CHANGES
  // ==========================================================

  useEffect(() => {
    if (selectedProjectId) {
      loadReport(selectedProjectId);
    }
  }, [selectedProjectId]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = () => {
    if (selectedProjectId) {
      loadReport(selectedProjectId);
    } else {
      loadProjects();
    }
  };

  // ==========================================================
  // PROJECT NAME
  // ==========================================================

  const projectName = useMemo(() => {
    if (!report?.project) {
      return "Project Report";
    }

    return report.project.name || report.project.title || "Project Report";
  }, [report]);

  // ==========================================================
  // COMPLETION PERCENTAGE
  // ==========================================================

  const completionPercentage = useMemo(() => {
    if (!report || report.taskStats.total === 0) {
      return 0;
    }

    return Math.round(
      (report.taskStats.completed / report.taskStats.total) * 100,
    );
  }, [report]);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        backgroundColor: "#f8fafc",
      }}
    >
      {/* ====================================================
          PAGE HEADER
      ==================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
        spacing={2}
        mb={3}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #4338ca, #6366f1)",
              color: "#fff",
            }}
          >
            <AssessmentRoundedIcon />
          </Box>

          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "#111827",
              }}
            >
              Reports
            </Typography>

            <Typography
              sx={{
                color: "#6b7280",
                fontSize: 14,
                mt: 0.3,
              }}
            >
              Monitor project progress, tasks, issues and repositories.
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={handleRefresh}
          disabled={loadingProjects || loadingReport}
          sx={{
            textTransform: "none",
            borderRadius: 1.5,
            fontWeight: 600,
          }}
        >
          Refresh
        </Button>
      </Stack>

      {/* ====================================================
          ERROR
      ==================================================== */}

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

      {/* ====================================================
          PROJECT SELECTOR
      ==================================================== */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid #e5e7eb",
          borderRadius: 2.5,
          mb: 3,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
          }}
        >
          <Stack spacing={1.2}>
            <Typography
              sx={{
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Select Project
            </Typography>

            <FormControl
              fullWidth
              size="small"
              disabled={loadingProjects || projects.length === 0}
            >
              <InputLabel id="project-select-label">Project</InputLabel>

              <Select
                labelId="project-select-label"
                value={selectedProjectId}
                label="Project"
                onChange={(event) => {
                  setSelectedProjectId(event.target.value);
                }}
              >
                {projects.map((project, index) => {
                  const projectId =
                    project.id || project._id || `project-${index}`;

                  const projectTitle =
                    project.name || project.title || `Project ${index + 1}`;

                  return (
                    <MenuItem key={projectId} value={projectId}>
                      {projectTitle}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {!loadingProjects && projects.length === 0 && (
              <Typography
                sx={{
                  color: "#6b7280",
                  fontSize: 13,
                }}
              >
                No projects are available.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* ====================================================
          PROJECT LOADING
      ==================================================== */}

      {loadingProjects && (
        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack alignItems="center" spacing={1.5}>
            <CircularProgress />

            <Typography
              sx={{
                color: "#6b7280",
                fontSize: 14,
              }}
            >
              Loading projects...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* ====================================================
          REPORT LOADING
      ==================================================== */}

      {!loadingProjects && loadingReport && (
        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack alignItems="center" spacing={1.5}>
            <CircularProgress />

            <Typography
              sx={{
                color: "#6b7280",
                fontSize: 14,
              }}
            >
              Generating project report...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* ====================================================
          REPORT
      ==================================================== */}

      {!loadingProjects && !loadingReport && report && (
        <Stack spacing={3}>
          {/* ================================================
                PROJECT INFORMATION
            ================================================ */}

          <Card
            elevation={0}
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: 2.5,
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "#6b7280",
                      mb: 0.5,
                    }}
                  >
                    Project
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: "#111827",
                    }}
                  >
                    {projectName}
                  </Typography>
                </Box>

                {report.project.description && (
                  <Typography
                    sx={{
                      color: "#6b7280",
                      fontSize: 14,
                      lineHeight: 1.7,
                    }}
                  >
                    {report.project.description}
                  </Typography>
                )}

                <Divider />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      Project ID
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#374151",
                        wordBreak: "break-all",
                      }}
                    >
                      {report.project.id ||
                        report.project._id ||
                        selectedProjectId}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      Members
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#111827",
                      }}
                    >
                      {report.project.membersCount ?? 0}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      Repositories
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#111827",
                      }}
                    >
                      {report.repositoriesCount}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          {/* ================================================
                SUMMARY CARDS
            ================================================ */}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                title="Total Tasks"
                value={report.taskStats.total}
                icon={<AssignmentRoundedIcon />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                title="Completed"
                value={report.taskStats.completed}
                icon={<CheckCircleRoundedIcon />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                title="In Progress"
                value={report.taskStats.inProgress}
                icon={<ScheduleRoundedIcon />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                title="Issues"
                value={report.issueStats.total}
                icon={<BugReportRoundedIcon />}
              />
            </Grid>
          </Grid>

          {/* ================================================
                TASK + ISSUE REPORT
            ================================================ */}

          <Grid container spacing={3}>
            {/* TASK REPORT */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid #e5e7eb",
                  borderRadius: 2.5,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 17,
                      color: "#111827",
                      mb: 2,
                    }}
                  >
                    Task Overview
                  </Typography>

                  <Stack spacing={2}>
                    <StatRow
                      label="Completed"
                      value={report.taskStats.completed}
                      total={report.taskStats.total}
                    />

                    <StatRow
                      label="In Progress"
                      value={report.taskStats.inProgress}
                      total={report.taskStats.total}
                    />

                    <StatRow
                      label="To Do"
                      value={report.taskStats.todo}
                      total={report.taskStats.total}
                    />
                  </Stack>

                  <Divider sx={{ my: 2.5 }} />

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#6b7280",
                      }}
                    >
                      Completion Rate
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#4338ca",
                      }}
                    >
                      {completionPercentage}%
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* ISSUE REPORT */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid #e5e7eb",
                  borderRadius: 2.5,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 17,
                      color: "#111827",
                      mb: 2,
                    }}
                  >
                    Issue Overview
                  </Typography>

                  <Stack spacing={2}>
                    <StatRow
                      label="Open"
                      value={report.issueStats.open}
                      total={report.issueStats.total}
                    />

                    <StatRow
                      label="In Progress"
                      value={report.issueStats.inProgress}
                      total={report.issueStats.total}
                    />

                    <StatRow
                      label="Resolved / Closed"
                      value={report.issueStats.resolved}
                      total={report.issueStats.total}
                    />
                  </Stack>

                  <Divider sx={{ my: 2.5 }} />

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#6b7280",
                      }}
                    >
                      Total Issues
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#111827",
                      }}
                    >
                      {report.issueStats.total}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ================================================
                REPOSITORY OVERVIEW
            ================================================ */}

          <Card
            elevation={0}
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: 2.5,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <StorageRoundedIcon
                  sx={{
                    color: "#4338ca",
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 17,
                    color: "#111827",
                  }}
                >
                  Repository Overview
                </Typography>
              </Stack>

              <Typography
                sx={{
                  mt: 1,
                  color: "#6b7280",
                  fontSize: 14,
                }}
              >
                This project currently has{" "}
                <strong>{report.repositoriesCount}</strong> connected{" "}
                {report.repositoriesCount === 1 ? "repository" : "repositories"}
                .
              </Typography>
            </CardContent>
          </Card>

          {/* ================================================
                GENERATED TIME
            ================================================ */}

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "#f1f5f9",
              border: "1px solid #e2e8f0",
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: "#64748b",
                textAlign: "right",
              }}
            >
              Report generated: {new Date(report.generatedAt).toLocaleString()}
            </Typography>
          </Paper>
        </Stack>
      )}

      {/* ====================================================
          NO PROJECTS
      ==================================================== */}

      {!loadingProjects &&
        !loadingReport &&
        projects.length === 0 &&
        !error && (
          <Paper
            elevation={0}
            sx={{
              minHeight: 250,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2.5,
              border: "1px solid #e5e7eb",
            }}
          >
            <Typography
              sx={{
                color: "#6b7280",
              }}
            >
              No projects are available.
            </Typography>
          </Paper>
        )}

      {/* ====================================================
          NO REPORT
      ==================================================== */}

      {!loadingProjects &&
        !loadingReport &&
        !report &&
        projects.length > 0 &&
        !error && (
          <Paper
            elevation={0}
            sx={{
              minHeight: 250,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2.5,
              border: "1px solid #e5e7eb",
            }}
          >
            <Typography
              sx={{
                color: "#6b7280",
              }}
            >
              Select a project to generate its report.
            </Typography>
          </Paper>
        )}
    </Box>
  );
};

// ============================================================
// SUMMARY CARD
// ============================================================

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const SummaryCard = ({ title, value, icon }: SummaryCardProps) => {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: 2.5,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              sx={{
                fontSize: 12,
                color: "#6b7280",
                mb: 0.5,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                fontSize: 26,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#eef2ff",
              color: "#4338ca",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// ============================================================
// STATISTIC ROW
// ============================================================

interface StatRowProps {
  label: string;
  value: number;
  total: number;
}

const StatRow = ({ label, value, total }: StatRowProps) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={0.7}>
        <Typography
          sx={{
            fontSize: 13,
            color: "#374151",
            fontWeight: 600,
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            color: "#6b7280",
            fontWeight: 600,
          }}
        >
          {value} ({percentage}%)
        </Typography>
      </Stack>

      <Box
        sx={{
          width: "100%",
          height: 7,
          borderRadius: 5,
          backgroundColor: "#e5e7eb",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${percentage}%`,
            height: "100%",
            borderRadius: 5,
            background: "linear-gradient(90deg, #4338ca, #6366f1)",
            transition: "width 0.3s ease",
          }}
        />
      </Box>
    </Box>
  );
};

export default Reports;
