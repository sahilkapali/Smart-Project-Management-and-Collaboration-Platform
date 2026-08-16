import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";

import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import projectService from "../../services/project.service";

import type {
  Project,
} from "../../types/project.types";

const ProjectDetails = () => {
  const navigate = useNavigate();

  const { projectId } =
    useParams<{
      projectId: string;
    }>();

  const [project, setProject] =
    useState<Project | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setError(
          "Project ID is missing.",
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await projectService.getProjectById(
            projectId,
          );

        setProject(data);
      } catch (err: unknown) {
        console.error(
          "Project details loading failed:",
          err,
        );

        const responseError =
          err as {
            response?: {
              data?: {
                message?: string;
              };
            };
          };

        setError(
          responseError.response?.data
            ?.message ??
            "Unable to load project details.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleBack = () => {
    navigate("/projects");
  };

  const handleEdit = () => {
    if (!project?.id) {
      return;
    }

    navigate(
      `/projects/${project.id}/edit`,
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Loading project...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          width: "100%",
          p: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <Button
          startIcon={
            <ArrowBackRoundedIcon />
          }
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Projects
        </Button>

        <Alert
          severity="error"
          sx={{
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box
        sx={{
          width: "100%",
          p: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <Button
          startIcon={
            <ArrowBackRoundedIcon />
          }
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Projects
        </Button>

        <Alert
          severity="info"
          sx={{
            borderRadius: 2,
          }}
        >
          No project data available.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        bgcolor: "background.default",
        p: {
          xs: 1.5,
          sm: 2,
          md: 3,
        },
      }}
    >
      {/* =====================================================
          TOP ACTIONS
      ====================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        sx={{
          mb: 2.5,
        }}
      >
        <Button
          startIcon={
            <ArrowBackRoundedIcon />
          }
          onClick={handleBack}
          sx={{
            alignSelf: {
              xs: "flex-start",
              sm: "center",
            },
          }}
        >
          Back to Projects
        </Button>

        <Button
          variant="contained"
          onClick={handleEdit}
        >
          Edit Project
        </Button>
      </Stack>

      {/* =====================================================
          PROJECT HEADER
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2,
            sm: 2.5,
            md: 3,
          },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          mb: 2,
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.hover",
                  color: "primary.main",
                  flexShrink: 0,
                }}
              >
                <FolderRoundedIcon
                  sx={{
                    fontSize: 28,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{
                    fontSize: {
                      xs: "1.5rem",
                      sm: "1.8rem",
                      md: "2rem",
                    },
                    wordBreak:
                      "break-word",
                  }}
                >
                  {project.name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Project Details
                </Typography>
              </Box>
            </Stack>

            <ProjectStatus
              status={project.status}
            />
          </Stack>

          <Divider />

          {/* Description */}

          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                mb: 1,
              }}
            >
              <InfoOutlinedIcon
                sx={{
                  fontSize: 20,
                  color: "primary.main",
                }}
              />

              <Typography
                fontWeight={700}
              >
                Description
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {project.description ||
                "No description available."}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* =====================================================
          PROJECT INFORMATION
      ====================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        <InformationCard
          icon={
            <GroupsRoundedIcon />
          }
          title="Team"
          value={
            project.teamId ||
            "No available data"
          }
        />

        <InformationCard
          icon={
            <CalendarMonthRoundedIcon />
          }
          title="Start Date"
          value={formatDate(
            project.startDate,
          )}
        />

        <InformationCard
          icon={
            <CalendarMonthRoundedIcon />
          }
          title="End Date"
          value={formatDate(
            project.endDate,
          )}
        />

        <InformationCard
          icon={
            <BadgeRoundedIcon />
          }
          title="Project ID"
          value={
            project.id ||
            "No available data"
          }
        />

        <InformationCard
          icon={
            <CalendarMonthRoundedIcon />
          }
          title="Created At"
          value={formatDateTime(
            project.createdAt,
          )}
        />

        <InformationCard
          icon={
            <CalendarMonthRoundedIcon />
          }
          title="Last Updated"
          value={formatDateTime(
            project.updatedAt,
          )}
        />
      </Box>

      {/* =====================================================
          UNAVAILABLE DATA NOTICE
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction="row"
          spacing={1.2}
          alignItems="flex-start"
        >
          <InfoOutlinedIcon
            sx={{
              color: "text.secondary",
              mt: 0.2,
            }}
          />

          <Box>
            <Typography
              variant="body2"
              fontWeight={700}
            >
              Additional project information
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.4,
              }}
            >
              Task counts, member lists,
              progress and other project
              statistics are not currently
              provided by the project API.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

/* =========================================================
   STATUS
========================================================= */

interface ProjectStatusProps {
  status?: string | null;
}

const ProjectStatus = ({
  status,
}: ProjectStatusProps) => {
  if (!status) {
    return (
      <Chip
        label="No available data"
        size="small"
      />
    );
  }

  const formattedStatus =
    status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase(),
      );

  return (
    <Chip
      label={formattedStatus}
      color="primary"
      variant="outlined"
      size="small"
      sx={{
        fontWeight: 600,
      }}
    />
  );
};

/* =========================================================
   INFORMATION CARD
========================================================= */

interface InformationCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

const InformationCard = ({
  icon,
  title,
  value,
}: InformationCardProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        minHeight: 110,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="flex-start"
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.hover",
            color: "primary.main",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box
          sx={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              mt: 0.5,
              wordBreak: "break-word",
            }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

/* =========================================================
   DATE HELPERS
========================================================= */

const formatDate = (
  value?: string | null,
): string => {
  if (!value) {
    return "No available data";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString();
};

const formatDateTime = (
  value?: string,
): string => {
  if (!value) {
    return "No available data";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString();
};

export default ProjectDetails;