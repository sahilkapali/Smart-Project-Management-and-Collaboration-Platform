import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

import ReactMarkdown from "react-markdown";

interface AIResponseCardProps {
  title?: string;

  response: string;
}

const AIResponseCard = ({
  title = "AI Result",
  response,
}: AIResponseCardProps) => {
  if (!response?.trim()) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: {
          xs: 2,
          sm: 3,
        },

        borderRadius: 3,

        border: "1px solid",

        borderColor: "divider",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          mb: 2,
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          color: "text.primary",

          lineHeight: 1.75,

          overflowWrap:
            "anywhere",

          "& p": {
            mt: 0,
            mb: 1.5,
          },

          "& p:last-child": {
            mb: 0,
          },

          "& h1, & h2, & h3, & h4":
            {
              mt: 2,
              mb: 1,
              fontWeight: 700,
            },

          "& ul, & ol": {
            pl: 3,
            mb: 1.5,
          },

          "& li": {
            mb: 0.5,
          },

          "& blockquote": {
            m: 0,
            mb: 1.5,
            pl: 2,

            borderLeft:
              "3px solid",

            borderColor:
              "divider",

            color:
              "text.secondary",
          },

          "& code": {
            px: 0.5,
            py: 0.25,

            borderRadius: 1,

            backgroundColor:
              "action.hover",

            fontFamily:
              "monospace",
          },

          "& pre": {
            p: 2,

            mb: 1.5,

            overflowX:
              "auto",

            borderRadius: 2,

            backgroundColor:
              "action.hover",
          },

          "& pre code": {
            p: 0,

            backgroundColor:
              "transparent",
          },

          "& a": {
            color:
              "primary.main",
          },

          "& table": {
            width: "100%",

            borderCollapse:
              "collapse",

            mb: 1.5,
          },

          "& th, & td": {
            border: "1px solid",

            borderColor:
              "divider",

            p: 1,

            textAlign:
              "left",
          },
        }}
      >
        <ReactMarkdown>
          {response}
        </ReactMarkdown>
      </Box>
    </Paper>
  );
};

export default AIResponseCard;