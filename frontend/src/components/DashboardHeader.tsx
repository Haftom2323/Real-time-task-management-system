import React from 'react';
import { AppBar, Toolbar, Typography, Avatar, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import NotificationDrawer from './Notification/NotificationDrawer';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { logout } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  title: string;
  showNotification?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, showNotification }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    navigate('/login');
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700 }}>
          {title}
        </Typography>
        {showNotification && <NotificationDrawer />}
        <IconButton onClick={handleAvatarClick} sx={{ ml: 2 }}>
          <Avatar>{user?.name?.[0] || 'U'}</Avatar>
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem disabled>{user?.name}</MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader; 