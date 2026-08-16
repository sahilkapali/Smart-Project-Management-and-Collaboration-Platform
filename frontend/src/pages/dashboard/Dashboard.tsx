import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";

import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        backgroundColor: "background.default",
      }}
    >
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Dashboard
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.firstName || "User"}!
          </Typography>
        </Box>

        {/* User Information */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  User
                </Typography>

                <Typography variant="h6" fontWeight={600}>
                  {user ? `${user.firstName} ${user.lastName}` : "User"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email
                </Typography>

                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{
                    wordBreak: "break-word",
                  }}
                >
                  {user?.email || "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Role
                </Typography>

                <Typography variant="h6" fontWeight={600}>
                  {user?.role || "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Account Status
                </Typography>

                <Typography variant="h6" fontWeight={600}>
                  Active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Project Management Summary */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Project Management
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Your project, task, meeting, notification, AI, and reporting
              features will appear here as we integrate the remaining backend
              modules.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default Dashboard;
