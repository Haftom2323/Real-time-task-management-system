import React from 'react';
import { Drawer, List, ListItem, ListItemText, Typography, Box, Divider, IconButton, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useDispatch, useSelector } from 'react-redux';
import { markAllAsRead } from '../../features/notifications/notificationsSlice';
import type { RootState } from '../../app/store';
import { Close as CloseIcon } from '@mui/icons-material';

const NotificationDrawer: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);
  const dispatch = useDispatch();

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    
    if (open) {
      dispatch(markAllAsRead());
    }
    setOpen(open);
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      default:
        return 'primary.main';
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={toggleDrawer(true)}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: { width: 350, maxWidth: '90vw' }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          <IconButton onClick={toggleDrawer(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{
                    borderLeft: `4px solid ${getNotificationColor(notification.type)}`,
                    mb: 0.5,
                    bgcolor: notification.seen ? 'background.paper' : 'action.hover'
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography 
                        variant="body2" 
                        color="text.primary"
                        sx={{ fontWeight: notification.seen ? 'normal' : 'bold' }}
                      >
                        {notification.message}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Drawer>
    </>
  );
};

export default NotificationDrawer;
