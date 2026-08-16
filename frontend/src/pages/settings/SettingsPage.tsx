import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, List, ListItemButton, ListItemIcon, ListItemText,
  Paper, Stack, FormControl, Select, MenuItem, TextField, Button, Card,
  CardActionArea, CardContent, type SelectChangeEvent, Switch, FormControlLabel,
  FormGroup, IconButton
} from '@mui/material';
import toast from 'react-hot-toast';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { mode: themeMode, setMode: setThemeMode } = useAppTheme();
  const { user, updateUserProfile } = useAuth() as any;

  // Default active tab to 'account'
  const [activeTab, setActiveTab] = useState('account');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Account Preferences States
  const [language, setLanguage] = useState('English');
  const [timeZone, setTimeZone] = useState('(UTC +05:45) Kathmandu');
  const [dateFormat, setDateFormat] = useState('DD MM YYYY');

  // Notification Preferences States
  const [notifications, setNotifications] = useState({
    emailAlerts: user?.notifications?.emailAlerts ?? true,
    pushNotifications: user?.notifications?.pushNotifications ?? true,
    weeklyDigest: user?.notifications?.weeklyDigest ?? false,
    securityAlerts: user?.notifications?.securityAlerts ?? true,
  });

  // Privacy Settings States
  const [privacy, setPrivacy] = useState({
    profileVisibility: user?.privacy?.profileVisibility || 'public',
    allowIndexing: user?.privacy?.allowIndexing ?? false,
    shareAnalytics: user?.privacy?.shareAnalytics ?? true,
  });

  const navItems = [
    { id: 'account', label: 'Account Settings', icon: <SettingsOutlinedIcon /> },
    { id: 'notifications', label: 'Notification Settings', icon: <NotificationsNoneIcon /> },
    { id: 'privacy', label: 'Privacy Settings', icon: <LockOutlinedIcon /> },
    { id: 'appearance', label: 'Appearance', icon: <PaletteOutlinedIcon /> },
  ];

  const handleNotificationToggle = (field: keyof typeof notifications) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNotifications({ ...notifications, [field]: e.target.checked });
  };

  const handlePrivacyToggle = (field: keyof typeof privacy) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPrivacy({ ...privacy, [field]: e.target.checked });
  };

  const handleSaveNotifications = async () => {
    try {
      setIsSubmitting(true);
      if (updateUserProfile) {
        await updateUserProfile({ notifications });
      }
      toast.success('Notification preferences saved!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save notification settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setIsSubmitting(true);
      if (updateUserProfile) {
        await updateUserProfile({ privacy });
      }
      toast.success('Privacy settings saved!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save privacy settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1100px', mx: 'auto' }}>
      {/* Back Button and Header */}
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <IconButton 
          onClick={() => navigate('/dashboard')} 
          sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="bold">Settings</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your account preferences and controls.
          </Typography>
        </Box>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', minHeight: 520 }}>
        <Grid container>
          {/* Navigation Sidebar */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ borderRight: 1, borderColor: 'divider', p: 1.5 }}>
            <List disablePadding>
              {navItems.map((item) => (
                <ListItemButton
                  key={item.id}
                  selected={activeTab === item.id}
                  onClick={() => setActiveTab(item.id)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': { bgcolor: 'action.selected', fontWeight: 'bold' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: activeTab === item.id ? 'primary.main' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: activeTab === item.id ? 600 : 400 }} 
                  />
                </ListItemButton>
              ))}
            </List>
          </Grid>

          {/* Form Content Pane */}
          <Grid size={{ xs: 12, md: 8 }} sx={{ p: { xs: 2, md: 4 } }}>
            {/* 1. ACCOUNT SETTINGS TAB */}
            {activeTab === 'account' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" mb={3}>Account Settings</Typography>

                <Stack spacing={3} maxWidth={540}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2}>
                    <Typography variant="body1" sx={{ minWidth: 120 }}>Language</Typography>
                    <FormControl size="small" fullWidth sx={{ maxWidth: 320 }}>
                      <Select value={language} onChange={(e: SelectChangeEvent) => setLanguage(e.target.value)} sx={{ borderRadius: 2 }}>
                        <MenuItem value="English">English</MenuItem>
                        <MenuItem value="Spanish">Spanish</MenuItem>
                        <MenuItem value="French">French</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2}>
                    <Typography variant="body1" sx={{ minWidth: 120 }}>Time Zone</Typography>
                    <FormControl size="small" fullWidth sx={{ maxWidth: 320 }}>
                      <Select value={timeZone} onChange={(e: SelectChangeEvent) => setTimeZone(e.target.value)} sx={{ borderRadius: 2 }}>
                        <MenuItem value="(UTC +05:45) Kathmandu">(UTC +05:45) Kathmandu</MenuItem>
                        <MenuItem value="(UTC +00:00) London">(UTC +00:00) London</MenuItem>
                        <MenuItem value="(UTC -05:00) New York">(UTC -05:00) New York</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2}>
                    <Typography variant="body1" sx={{ minWidth: 120 }}>Date Format</Typography>
                    <TextField
                      size="small"
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      fullWidth
                      sx={{ maxWidth: 320, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Stack>

                  <Box pt={2}>
                    <Button variant="contained" color="error" sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}>
                      Delete Account
                    </Button>
                  </Box>
                </Stack>
              </Box>
            )}

            {/* 2. NOTIFICATION SETTINGS TAB */}
            {activeTab === 'notifications' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" mb={1}>Notification Settings</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Manage how and when you receive updates.
                </Typography>

                <Stack spacing={3} maxWidth={540}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.emailAlerts}
                          onChange={handleNotificationToggle('emailAlerts')}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2">Email Notifications</Typography>
                          <Typography variant="caption" color="text.secondary">Receive repository updates and comments via email.</Typography>
                        </Box>
                      }
                      sx={{ mb: 2, alignItems: 'flex-start' }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.pushNotifications}
                          onChange={handleNotificationToggle('pushNotifications')}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2">Push Notifications</Typography>
                          <Typography variant="caption" color="text.secondary">Get instant notifications inside the app interface.</Typography>
                        </Box>
                      }
                      sx={{ mb: 2, alignItems: 'flex-start' }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.weeklyDigest}
                          onChange={handleNotificationToggle('weeklyDigest')}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2">Weekly Summary</Typography>
                          <Typography variant="caption" color="text.secondary">Receive a weekly digest of project activity and team progress.</Typography>
                        </Box>
                      }
                      sx={{ mb: 2, alignItems: 'flex-start' }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.securityAlerts}
                          onChange={handleNotificationToggle('securityAlerts')}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2">Security & Login Alerts</Typography>
                          <Typography variant="caption" color="text.secondary">Get notified of new sign-ins or password changes.</Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start' }}
                    />
                  </FormGroup>

                  <Box pt={1}>
                    <Button
                      variant="contained"
                      onClick={handleSaveNotifications}
                      disabled={isSubmitting}
                      sx={{ textTransform: 'none', borderRadius: 2, px: 4 }}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            )}

            {/* 3. PRIVACY SETTINGS TAB */}
            {activeTab === 'privacy' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" mb={1}>Privacy Settings</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Control profile visibility and analytics data handling.
                </Typography>

                <Stack spacing={3} maxWidth={540}>
                  <Box>
                    <Typography variant="subtitle2" mb={1}>Profile Visibility</Typography>
                    <FormControl size="small" fullWidth sx={{ maxWidth: 320 }}>
                      <Select
                        value={privacy.profileVisibility}
                        onChange={(e: SelectChangeEvent) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="public">Public (Everyone)</MenuItem>
                        <MenuItem value="team">Team Members Only</MenuItem>
                        <MenuItem value="private">Private (Only Me)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={privacy.allowIndexing}
                          onChange={handlePrivacyToggle('allowIndexing')}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2">Search Engine Indexing</Typography>
                          <Typography variant="caption" color="text.secondary">Allow public search engines to index your public repositories.</Typography>
                        </Box>
                      }
                      sx={{ mb: 2, alignItems: 'flex-start' }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={privacy.shareAnalytics}
                          onChange={handlePrivacyToggle('shareAnalytics')}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2">Usage Analytics</Typography>
                          <Typography variant="caption" color="text.secondary">Share anonymous usage data to help improve performance.</Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start' }}
                    />
                  </FormGroup>

                  <Box pt={1}>
                    <Button
                      variant="contained"
                      onClick={handleSavePrivacy}
                      disabled={isSubmitting}
                      sx={{ textTransform: 'none', borderRadius: 2, px: 4 }}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Privacy Settings'}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            )}

            {/* 4. APPEARANCE SETTINGS TAB */}
            {activeTab === 'appearance' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" mb={1}>Appearance</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Customize workspace themes and interface styling.
                </Typography>

                <Stack spacing={3} maxWidth={540}>
                  <Box>
                    <Typography variant="subtitle2" mb={2}>Theme Mode</Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: themeMode === 'light' ? 'primary.main' : 'divider', borderWidth: themeMode === 'light' ? 2 : 1 }}>
                          <CardActionArea onClick={() => setThemeMode('light')} sx={{ p: 2, textAlign: 'center' }}>
                            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                              <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5, display: 'inline-flex', mb: 1 }}>
                                <WbSunnyOutlinedIcon sx={{ color: '#f57c00' }} />
                              </Box>
                              <Typography variant="subtitle2" fontWeight="bold">Light</Typography>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: themeMode === 'dark' ? 'primary.main' : 'divider', borderWidth: themeMode === 'dark' ? 2 : 1 }}>
                          <CardActionArea onClick={() => setThemeMode('dark')} sx={{ p: 2, textAlign: 'center' }}>
                            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                              <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5, display: 'inline-flex', mb: 1 }}>
                                <DarkModeOutlinedIcon sx={{ color: '#9c27b0' }} />
                              </Box>
                              <Typography variant="subtitle2" fontWeight="bold">Dark</Typography>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: themeMode === 'system' ? 'primary.main' : 'divider', borderWidth: themeMode === 'system' ? 2 : 1 }}>
                          <CardActionArea onClick={() => setThemeMode('system')} sx={{ p: 2, textAlign: 'center' }}>
                            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                              <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5, display: 'inline-flex', mb: 1 }}>
                                <SettingsBrightnessIcon sx={{ color: 'text.secondary' }} />
                              </Box>
                              <Typography variant="subtitle2" fontWeight="bold">System</Typography>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>
              </Box>
            )}

          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SettingsPage;