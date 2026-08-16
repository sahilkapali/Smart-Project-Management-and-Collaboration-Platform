import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface ActionItemsCardProps {
  actionItems?: string[];
  onGenerate?: () => void;
  loading?: boolean;
}

const ActionItemsCard = ({
  actionItems = [],
  onGenerate,
  loading = false,
}: ActionItemsCardProps) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Typography
            variant="h6"
            fontWeight={700}
          >
            Action Items
          </Typography>

          {actionItems.length === 0 ? (
            <Typography color="text.secondary">
              No action items have been extracted.
            </Typography>
          ) : (
            <List>
              {actionItems.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>

                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          )}

          {onGenerate && (
            <Button
              variant="outlined"
              startIcon={
                loading ? (
                  <CircularProgress
                    size={18}
                  />
                ) : (
                  <AutoAwesomeIcon />
                )
              }
              onClick={onGenerate}
              disabled={loading}
            >
              {loading
                ? "Analyzing..."
                : "Extract Action Items"}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ActionItemsCard;