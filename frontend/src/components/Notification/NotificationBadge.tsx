import React from 'react';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import IconButton from '@mui/material/IconButton';
import { useDispatch, useSelector } from 'react-redux';
import { markAllAsRead } from '../../features/notifications/notificationsSlice';
import type { RootState } from '../../app/store';

const NotificationBadge: React.FC = () => {
  const unread = useSelector((state: RootState) => state.notifications.unreadCount);
  const dispatch = useDispatch();

  return (
    <IconButton color="inherit" onClick={() => dispatch(markAllAsRead())}>
      <Badge badgeContent={unread} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default NotificationBadge;