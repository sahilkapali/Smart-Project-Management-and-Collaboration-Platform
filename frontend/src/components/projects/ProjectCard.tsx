import {
  Box,
  IconButton,
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Project } from "../../types/project.types";

interface ProjectCardProps {
  project: Project;

  onDelete?: (
    project: Project,
  ) => void;
}

const ProjectCard = ({
  project,
  onDelete,
}: ProjectCardProps) => {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const menuOpen = Boolean(anchorEl);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    event.stopPropagation();

    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenProject = () => {
    navigate(
      `/projects/${project.id}`,
    );
  };

  const handleEdit = () => {
    handleCloseMenu();

    navigate(
      `/projects/${project.id}/edit`,
    );
  };

  const handleDelete = () => {
    handleCloseMenu();

    onDelete?.(project);
  };

  const formatDate = (
    value?: string | null,
  ) => {
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

  const formatStatus = (
    value?: string | null,
  ) => {
    if (!value) {
      return "No available data";
    }

    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase(),
      );
  };

  return (
    <Paper
      elevation={0}
      onClick={handleOpenProject}
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        cursor: "pointer",

        transition:
          "transform 0.18s ease, box-shadow 0.18s ease",

        "&:hover": {
          transform:
            "translateY(-2px)",

          boxShadow:
            "0 10px 28px rgba(0,0,0,0.08)",
        },
      }}
    >
      <Stack spacing={2}>
        {/* Header */}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                flexShrink: 0,
                borderRadius: 2,
                bgcolor:
                  "action.hover",
                color:
                  "primary.main",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              <FolderRoundedIcon
                fontSize="small"
              />
            </Box>

            <Typography
              fontWeight={700}
              noWrap
              sx={{
                maxWidth: "100%",
              }}
            >
              {project.name}
            </Typography>
          </Stack>

          <IconButton
            size="small"
            onClick={
              handleOpenMenu
            }
          >
            <MoreVertRoundedIcon fontSize="small" />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={
              handleCloseMenu
            }
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <MenuItem
              onClick={handleEdit}
            >
              Edit
            </MenuItem>

            <MenuItem
              onClick={handleDelete}
            >
              Delete
            </MenuItem>
          </Menu>
        </Stack>

        {/* Description */}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display:
              "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient:
              "vertical",
            overflow: "hidden",
            minHeight: 40,
          }}
        >
          {project.description ||
            "No description available."}
        </Typography>

        {/* Status */}

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mb: 0.6,
            }}
          >
            Status
          </Typography>

          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              display:
                "inline-flex",
              px: 1.2,
              py: 0.5,
              borderRadius: 1.5,
              bgcolor:
                "action.hover",
              color:
                "primary.main",
            }}
          >
            {formatStatus(
              project.status,
            )}
          </Typography>
        </Box>

        {/* Team */}

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <GroupsRoundedIcon
            sx={{
              fontSize: 18,
              color:
                "text.secondary",
            }}
          />

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Team ID
            </Typography>

            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                wordBreak:
                  "break-all",
              }}
            >
              {project.teamId ||
                "No available data"}
            </Typography>
          </Box>
        </Stack>

        {/* Dates */}

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <CalendarMonthRoundedIcon
            sx={{
              fontSize: 18,
              color:
                "text.secondary",
            }}
          />

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Project Dates
            </Typography>

            <Typography
              variant="body2"
              fontWeight={600}
            >
              {formatDate(
                project.startDate,
              )}
              {" — "}
              {formatDate(
                project.endDate,
              )}
            </Typography>
          </Box>
        </Stack>

        {/* Project ID */}

        <Box
          sx={{
            pt: 0.5,
            borderTop: "1px solid",
            borderColor:
              "divider",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Project ID
          </Typography>

          <Typography
            variant="caption"
            display="block"
            sx={{
              mt: 0.3,
              wordBreak:
                "break-all",
            }}
          >
            {project.id}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ProjectCard;