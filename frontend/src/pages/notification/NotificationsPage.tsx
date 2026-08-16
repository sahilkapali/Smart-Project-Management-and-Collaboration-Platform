import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Button, 
  Card, 
  CardContent, 
  Avatar, 
  Stack, 
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead 
} from '../../services/notification.service';
import type { Notification } from '../../types/notification.types';

// --- Helper Functions ---

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getAvatarConfig = (message: string) => {
  const words = message.split(' ');
  let initials = words[0]?.charAt(0).toUpperCase() || 'N';
  if (words.length > 1 && initials.length < 2) {
     const secondLetter = words[1]?.charAt(0);
     if (secondLetter && secondLetter.match(/[A-Z]/i)) {
         initials += secondLetter.toUpperCase();
     }
  }

  // MUI sx-compatible color themes
  const colorThemes = [
    { bgcolor: '#5da283', color: 'white' }, // Green
    { bgcolor: '#ac5a7a', color: 'white' }, // Pink/Maroon
    { bgcolor: '#8c7471', color: 'white' }, // Brown
    { bgcolor: '#e0e7ff', color: '#1e3a8a', fontWeight: 'bold' }, // Light Blue
    { bgcolor: '#9c27b0', color: 'white' }, // Purple
  ];
  
  const colorIndex = message.length % colorThemes.length;
  
  return {
    initials,
    theme: colorThemes[colorIndex]
  };
};

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getMyNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', maxWidth: '1200px', mx: 'auto', boxSizing: 'border-box' }}>
      {/* Page Header */}
      <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary" gutterBottom>
        Notification Page
      </Typography>
      
      <Divider sx={{ mb: 4, borderColor: 'grey.300' }} />

      {/* Sub-header & Action */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stay updated with your activities
          </Typography>
        </Box>
        
        <Button 
          variant="text" 
          onClick={handleMarkAllAsRead}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 500, 
            fontSize: '1rem',
            color: '#1e3a8a',
            '&:hover': { textDecoration: 'underline', backgroundColor: 'transparent' }
          }}
        >
          Mark all as read
        </Button>
      </Stack>

      {/* Notifications List */}
      <Stack spacing={2}>
        {notifications.length === 0 ? (
          <Card variant="outlined" sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              You have no notifications at this time.
            </Typography>
          </Card>
        ) : (
          notifications.map((notif) => {
            const avatar = getAvatarConfig(notif.message || notif.title);
            
            return (
              <Card 
                key={notif._id}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  opacity: notif.isRead ? 0.7 : 1,
                  cursor: notif.isRead ? 'default' : 'pointer',
                  transition: 'box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: notif.isRead ? 'none' : 2
                  }
                }}
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
              >
                <CardContent 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2.5,
                    '&:last-child': { pb: 2.5 } // Overrides MUI's default last-child padding
                  }}
                >
                  {/* Left Side: Avatar + Message */}
                  <Stack direction="row" spacing={2.5} alignItems="center" sx={{ pr: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        fontSize: '1.25rem',
                        ...avatar.theme 
                      }}
                    >
                      {avatar.initials}
                    </Avatar>
                    <Typography variant="body1" fontWeight={500} color="text.primary" sx={{ fontSize: '1.05rem' }}>
                      {notif.message || notif.title}
                    </Typography>
                  </Stack>

                  {/* Right Side: Time + Action Link */}
                  <Stack alignItems="flex-end" spacing={0.5} flexShrink={0}>
                    <Typography variant="body2" color="text.primary" fontWeight={500}>
                      {getTimeAgo(notif.createdAt)}
                    </Typography>
                    <Button 
                      variant="text" 
                      size="small"
                      sx={{ 
                        textTransform: 'none', 
                        color: '#1e3a8a', 
                        fontWeight: 500,
                        p: 0,
                        minWidth: 'auto',
                        '&:hover': { textDecoration: 'underline', backgroundColor: 'transparent' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); 
                        if (notif.link) {
                          window.location.href = notif.link;
                        }
                      }}
                    >
                      {notif.link ? 'View details' : 'View comment'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })
        )}
      </Stack>
    </Box>
  );
};

export default NotificationsPage;