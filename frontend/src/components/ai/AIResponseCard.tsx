import {
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface AIResponseCardProps {
  response: string;
}

const AIResponseCard = ({
  response,
}: AIResponseCardProps) => {
  return (
    <Card
      sx={{
        mt: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <AutoAwesomeIcon color="primary" />
          AI Response
        </Typography>

        <Typography
          sx={{
            whiteSpace: "pre-wrap",
            lineHeight: 1.7,
          }}
        >
          {response}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AIResponseCard;