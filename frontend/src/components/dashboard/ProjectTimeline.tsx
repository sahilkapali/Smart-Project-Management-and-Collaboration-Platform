import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export interface TimelineProject {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface ProjectTimelineProps {
  projects?: TimelineProject[];
}

const ProjectTimeline = ({
  projects = [],
}: ProjectTimelineProps) => {
  const hasData = projects.length > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        p: 2,
        height: "100%",
        minHeight: 320,
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: 2 }}
      >
        Project Timeline
      </Typography>

      {!hasData ? (
        <Box
          sx={{
            minHeight: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            No timeline data available
          </Typography>
        </Box>
      ) : (
        <TimelineChart projects={projects} />
      )}
    </Paper>
  );
};

interface TimelineChartProps {
  projects: TimelineProject[];
}

const TimelineChart = ({
  projects,
}: TimelineChartProps) => {
  const days = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];

  return (
    <>
      {/* Timeline header */}
      <Stack
        direction="row"
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 1,
        }}
      >
        {days.map((day) => (
          <Typography
            key={day}
            variant="caption"
            color="text.secondary"
            sx={{
              width: `${100 / 7}%`,
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            {day}
          </Typography>
        ))}
      </Stack>

      {/* Timeline */}
      <Box
        sx={{
          position: "relative",
          minHeight: 230,
          mt: 1,

          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px)",

          backgroundSize:
            "14.2857% 100%",
        }}
      >
        {projects.map((project, index) => (
          <TimelineProjectRow
            key={project.id}
            project={project}
            index={index}
          />
        ))}
      </Box>
    </>
  );
};

interface TimelineProjectRowProps {
  project: TimelineProject;
  index: number;
}

const TimelineProjectRow = ({
  project,
  index,
}: TimelineProjectRowProps) => {
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return null;
  }

  const startDay = start.getDay();
  const endDay = end.getDay();

  const normalizedStart =
    startDay === 0 ? 6 : startDay - 1;

  const normalizedEnd =
    endDay === 0 ? 6 : endDay - 1;

  const left =
    (normalizedStart / 7) * 100;

  const durationDays = Math.max(
    normalizedEnd - normalizedStart + 1,
    1,
  );

  const width =
    (durationDays / 7) * 100;

  return (
    <Box
      sx={{
        position: "relative",
        height: 38,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 12,
          left: `${left}%`,
          width: `${Math.min(width, 100 - left)}%`,
          height: 10,
          borderRadius: 5,
          bgcolor:
            index % 2 === 0
              ? "primary.main"
              : "primary.light",
        }}
        title={project.name}
      />
    </Box>
  );
};

export default ProjectTimeline;