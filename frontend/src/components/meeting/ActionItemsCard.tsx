import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface ActionItemsCardProps {
  actionItems?: string[];

  onGenerate?: () => void;

  loading?: boolean;

  error?: string;

  onClearError?: () => void;
}

const ActionItemsCard = ({
  actionItems = [],
  onGenerate,
  loading = false,
  error = "",
  onClearError,
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
      <CardContent>
        <Stack spacing={2.5}>

          {/* ================================================= */}
          {/* HEADER                                            */}
          {/* ================================================= */}

          <Stack spacing={0.5}>
            <Typography
              variant="h5"
              fontWeight={700}
            >
              AI Action Items
            </Typography>

            <Typography
              color="text.secondary"
            >
              Extract follow-up actions from
              all meeting notes.
            </Typography>
          </Stack>

          {/* ================================================= */}
          {/* ERROR                                             */}
          {/* ================================================= */}

          {error && (
            <Alert
              severity="error"
              onClose={onClearError}
            >
              {error}
            </Alert>
          )}

          {/* ================================================= */}
          {/* LOADING                                           */}
          {/* ================================================= */}

          {loading && (
            <Alert severity="info">
              AI is extracting action items
              from the meeting notes.
            </Alert>
          )}

          {/* ================================================= */}
          {/* ACTION ITEMS                                      */}
          {/* ================================================= */}

          {!loading &&
            actionItems.length === 0 && (
              <Alert severity="info">
                No action items have been
                extracted yet.
              </Alert>
            )}

          {!loading &&
            actionItems.length > 0 && (
              <List disablePadding>
                {actionItems.map(
                  (item, index) => (
                    <ListItem
                      key={`${item}-${index}`}
                      disableGutters
                      sx={{
                        alignItems:
                          "flex-start",

                        py: 0.75,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                        }}
                      >
                        <CheckCircleOutlineIcon
                          color="primary"
                        />
                      </ListItemIcon>

                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          sx: {
                            lineHeight: 1.6,
                          },
                        }}
                      />
                    </ListItem>
                  ),
                )}
              </List>
            )}

          {/* ================================================= */}
          {/* BUTTON                                            */}
          {/* ================================================= */}

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
              sx={{
                alignSelf:
                  "flex-start",

                textTransform:
                  "none",

                fontWeight: 700,
              }}
            >
              {loading
                ? "Extracting..."
                : actionItems.length > 0
                  ? "Regenerate Action Items"
                  : "Extract Action Items"}
            </Button>
          )}

        </Stack>
      </CardContent>
    </Card>
  );
};

export default ActionItemsCard;