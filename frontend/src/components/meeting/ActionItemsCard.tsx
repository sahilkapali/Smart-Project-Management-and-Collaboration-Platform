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
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* =====================================================
              HEADER
          ===================================================== */}

          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CheckCircleOutlineIcon color="primary" />
            Action Items
          </Typography>

          {/* =====================================================
              ACTION ITEMS
          ===================================================== */}

          {actionItems.length === 0 ? (
            <Typography color="text.secondary">
              No action items have been extracted.
            </Typography>
          ) : (
            <List disablePadding>
              {actionItems.map((item, index) => (
                <ListItem
                  key={`action-item-${index}`}
                  disableGutters
                  sx={{
                    alignItems: "flex-start",
                    py: 1,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      mt: 0.25,
                    }}
                  >
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>

                  <ListItemText
                    primary={item}
                    primaryTypographyProps={{
                      sx: {
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}

          {/* =====================================================
              GENERATE ACTION ITEMS
          ===================================================== */}

          {onGenerate && (
            <Button
              variant="outlined"
              startIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <AutoAwesomeIcon />
                )
              }
              onClick={onGenerate}
              disabled={loading}
              sx={{
                alignSelf: "flex-start",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {loading ? "Analyzing..." : "Extract Action Items"}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ActionItemsCard;
