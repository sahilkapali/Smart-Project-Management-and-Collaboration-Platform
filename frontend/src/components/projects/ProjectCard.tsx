import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";

import type { Project, ProjectStatus } from "../../types/project.types";

// ============================================================
// PROPS
// ============================================================

interface ProjectCardProps {
  project: Project;

  /**
   * Called when the user selects Edit.
   *
   * The parent page can open EditProjectDialog.
   */
  onEdit?: (project: Project) => void;

  /**
   * Called when the user selects Delete.
   */
  onDelete?: (project: Project) => void;
}

// ============================================================
// STATUS LABEL
// ============================================================

const formatStatus = (status?: ProjectStatus | string | null): string => {
  if (!status) {
    return "Not specified";
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

// ============================================================
// STATUS COLOR
// ============================================================

const getStatusColor = (status?: ProjectStatus | string | null) => {
  switch (status) {
    case "ACTIVE":
      return "success.main";

    case "COMPLETED":
      return "info.main";

    case "ARCHIVED":
      return "text.secondary";

    case "PLANNING":
      return "warning.main";

    default:
      return "primary.main";
  }
};

// ============================================================
// DATE FORMATTER
// ============================================================

const formatDate = (value?: string | null): string => {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
};

// ============================================================
// PROGRESS NORMALIZER
// ============================================================

const normalizeProgress = (progress?: number | null): number => {
  if (typeof progress !== "number" || Number.isNaN(progress)) {
    return 0;
  }

  return Math.min(100, Math.max(0, progress));
};

// ============================================================
// PROJECT CARD
// ============================================================

const ProjectCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuOpen = Boolean(anchorEl);

  const progress = normalizeProgress(project.progress);

  // ==========================================================
  // MENU
  // ==========================================================

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // ==========================================================
  // OPEN PROJECT
  // ==========================================================

  const handleOpenProject = () => {
    navigate(`/projects/${project.id}`);
  };

  // ==========================================================
  // EDIT PROJECT
  // ==========================================================

  const handleEdit = (event?: React.MouseEvent) => {
    event?.stopPropagation();

    handleCloseMenu();

    onEdit?.(project);
  };

  // ==========================================================
  // DELETE PROJECT
  // ==========================================================

  const handleDelete = (event?: React.MouseEvent) => {
    event?.stopPropagation();

    handleCloseMenu();

    onDelete?.(project);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  /*
   * ============================================================
   * PROJECT CARD
   * ============================================================
   */

  return (
    <Paper
      elevation={0}
      onClick={handleOpenProject}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();

          handleOpenProject();
        }
      }}
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        cursor: "pointer",

        transition: "transform 0.18s ease, box-shadow 0.18s ease",

        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
        },

        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <Stack spacing={2.25}>
        {/* ==================================================
            HEADER
        ================================================== */}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            {/* Project Icon */}

            <Box
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: 2,
                bgcolor: "action.hover",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FolderRoundedIcon fontSize="small" />
            </Box>

            {/* Project Name */}

            <Typography
              variant="subtitle1"
              fontWeight={700}
              noWrap
              sx={{
                minWidth: 0,
              }}
            >
              {project.name || "Untitled Project"}
            </Typography>
          </Stack>

          {/* ==================================================
              ACTION MENU
          ================================================== */}

          <IconButton
            size="small"
            aria-label="Project actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen ? "true" : undefined}
            onClick={handleOpenMenu}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <MoreVertRoundedIcon fontSize="small" />
          </IconButton>

          {/* =================================================
              MENU
          ================================================= */}

          <Menu
            id={`project-menu-${project.id}`}
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleCloseMenu}
            onClick={(event) => event.stopPropagation()}
          >
            <MenuItem onClick={handleEdit}>Edit Project</MenuItem>

            <MenuItem
              onClick={handleDelete}
              sx={{
                color: "error.main",
              }}
            >
              Delete Project
            </MenuItem>
          </Menu>
        </Stack>

        {/* ==================================================
            DESCRIPTION
        ================================================== */}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 40,
            lineHeight: 1.5,
          }}
        >
          {project.description?.trim() || "No description available."}
        </Typography>

        {/* ==================================================
            STATUS
        ================================================== */}

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mb: 0.75,
            }}
          >
            Status
          </Typography>

          <Typography
            component="span"
            variant="body2"
            fontWeight={700}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.25,
              py: 0.6,
              borderRadius: 1.5,
              bgcolor: "action.hover",
              color: getStatusColor(project.status),
            }}
          >
            {formatStatus(project.status)}
          </Typography>
        </Box>

        {/* ==================================================
            PROGRESS
        ================================================== */}

        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mb: 0.75,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Project Progress
            </Typography>

            <Typography variant="caption" fontWeight={700} color="text.primary">
              {progress}%
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 7,
              borderRadius: 10,
              bgcolor: "action.hover",
              "& .MuiLinearProgress-bar": {
                borderRadius: 10,
              },
            }}
          />
        </Box>

        {/* ==================================================
            TEAM
        ================================================== */}

        <Stack direction="row" spacing={1} alignItems="center">
          <GroupsRoundedIcon
            sx={{
              fontSize: 19,
              color: "text.secondary",
              flexShrink: 0,
            }}
          />

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Team
            </Typography>

            <Typography
              variant="body2"
              fontWeight={600}
              noWrap
              title={project.teamId || undefined}
            >
              {project.teamId || "No team assigned"}
            </Typography>
          </Box>
        </Stack>

        {/* ==================================================
            DATES
        ================================================== */}

        <Stack direction="row" spacing={1} alignItems="flex-start">
          <CalendarMonthRoundedIcon
            sx={{
              fontSize: 19,
              color: "text.secondary",
              flexShrink: 0,
              mt: 0.2,
            }}
          />

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Project Timeline
            </Typography>

            <Typography variant="body2" fontWeight={600}>
              {formatDate(project.startDate)}
              {" — "}
              {formatDate(project.endDate)}
            </Typography>
          </Box>
        </Stack>

        {/* ==================================================
            PROJECT ID
        ================================================== */}

        <Box
          sx={{
            pt: 1.25,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Project ID
          </Typography>

          <Typography
            variant="caption"
            display="block"
            sx={{
              mt: 0.3,
              wordBreak: "break-all",
              color: "text.secondary",
            }}
          >
            {project.id || "No available data"}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ProjectCard;
