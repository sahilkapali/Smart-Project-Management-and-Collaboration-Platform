import { Box } from "@mui/material";

interface ProjectActivityChartProps {
  value: number;
}

const ProjectActivityChart = ({
  value,
}: ProjectActivityChartProps) => {

  const height = 55;
  const width = 125;

  const intensity =
    Math.min(Math.max(value, 0), 10) / 10;

  const points = [
    [4, 42],
    [17, 31],
    [30, 37],
    [43, 23],
    [56, 31],
    [69, 14],
    [82, 29],
    [95, 8 + intensity * 10],
    [108, 21],
    [121, 6],
  ];

  const path = points
    .map(
      ([x, y], index) =>
        `${index === 0 ? "M" : "L"} ${x} ${y}`,
    )
    .join(" ");

  return (
    <Box
      sx={{
        width,
        height,
        display: {
          xs: "none",
          sm: "block",
        },
        flexShrink: 0,
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="projectArea"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="currentColor"
              stopOpacity="0.18"
            />

            <stop
              offset="100%"
              stopColor="currentColor"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <path
          d={`${path} L 121 55 L 4 55 Z`}
          fill="url(#projectArea)"
        />

        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};

export default ProjectActivityChart;