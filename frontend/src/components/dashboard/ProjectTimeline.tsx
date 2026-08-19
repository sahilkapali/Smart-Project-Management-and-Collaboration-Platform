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

  onProjectClick?: (
    project: TimelineProject,
  ) => void;
}

const ProjectTimeline = ({
  projects = [],

  onProjectClick,
}: ProjectTimelineProps) => {
  const hasData =
    projects.length > 0;

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
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
        >
          Project Timeline
        </Typography>

        {hasData && (
          <Typography
            variant="caption"
            color="primary.main"
            fontWeight={700}
          >
            Click a project
          </Typography>
        )}
      </Stack>

      {!hasData ? (
        <Box
          sx={{
            minHeight: 250,

            display: "flex",

            alignItems: "center",

            justifyContent:
              "center",

            textAlign: "center",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            No timeline data
            available
          </Typography>
        </Box>
      ) : (
        <TimelineChart
          projects={projects}
          onProjectClick={
            onProjectClick
          }
        />
      )}
    </Paper>
  );
};

interface TimelineChartProps {
  projects: TimelineProject[];

  onProjectClick?: (
    project: TimelineProject,
  ) => void;
}

const TimelineChart = ({
  projects,

  onProjectClick,
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
      <Stack
        direction="row"
        sx={{
          borderBottom:
            "1px solid",

          borderColor:
            "divider",

          pb: 1,
        }}
      >
        {days.map((day) => (
          <Typography
            key={day}
            variant="caption"
            color="text.secondary"
            sx={{
              width:
                `${100 / 7}%`,

              textAlign:
                "center",

              fontWeight: 500,
            }}
          >
            {day}
          </Typography>
        ))}
      </Stack>

      <Box
        sx={{
          position:
            "relative",

          minHeight: 230,

          mt: 1,

          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px)",

          backgroundSize:
            "14.2857% 100%",
        }}
      >
        {projects.map(
          (
            project,
            index,
          ) => (
            <TimelineProjectRow
              key={
                project.id
              }
              project={
                project
              }
              index={
                index
              }
              onClick={
                onProjectClick
              }
            />
          ),
        )}
      </Box>
    </>
  );
};

interface TimelineProjectRowProps {
  project: TimelineProject;

  index: number;

  onClick?: (
    project: TimelineProject,
  ) => void;
}

const TimelineProjectRow = ({
  project,

  index,

  onClick,
}: TimelineProjectRowProps) => {
  const start =
    new Date(
      project.startDate,
    );

  const end =
    new Date(
      project.endDate,
    );

  if (
    Number.isNaN(
      start.getTime(),
    ) ||
    Number.isNaN(
      end.getTime(),
    )
  ) {
    return null;
  }

  const startDay =
    start.getDay();

  const endDay =
    end.getDay();

  const normalizedStart =
    startDay === 0
      ? 6
      : startDay - 1;

  const normalizedEnd =
    endDay === 0
      ? 6
      : endDay - 1;

  const left =
    (normalizedStart / 7) *
    100;

  const durationDays =
    Math.max(
      normalizedEnd -
        normalizedStart +
        1,

      1,
    );

  const width =
    (durationDays / 7) *
    100;

  return (
    <Box
      sx={{
        position:
          "relative",

        height: 38,
      }}
    >
      <Box
        component="button"
        type="button"
        onClick={() =>
          onClick?.(project)
        }
        sx={{
          position:
            "absolute",

          top: 12,

          left: `${left}%`,

          width: `${Math.min(
            width,
            100 - left,
          )}%`,

          height: 10,

          border: 0,

          p: 0,

          borderRadius: 5,

          bgcolor:
            index % 2 === 0
              ? "primary.main"
              : "primary.light",

          cursor: onClick
            ? "pointer"
            : "default",

          transition:
            "transform 0.2s ease, opacity 0.2s ease",

          "&:hover": {
            transform:
              "scaleY(1.6)",

            opacity: 0.85,
          },
        }}
        title={
          project.name
        }
        aria-label={`View ${project.name}`}
      />
    </Box>
  );
};

export default ProjectTimeline;