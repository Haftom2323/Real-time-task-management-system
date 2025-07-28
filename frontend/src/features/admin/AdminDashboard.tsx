import React, { useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import TaskForm from '../../components/Task/TaskForm';
import TaskList from '../../components/Task/TaskList';
import DashboardHeader from '../../components/DashboardHeader';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { logout } from '../auth/authSlice';
import { useNavigate } from 'react-router';
import { socket } from '../../api/socket';
import axiosInstance from '../../api/axios';
import { addTask, updateTask, deleteTask } from './taskSlice';

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  useEffect(() => {
    socket.connect();
    if (user?._id) {
      socket.emit('register', user._id);
    }
    socket.on('task_created', async (data: { taskId: string }) => {
      try {
        const res = await axiosInstance.get(`/tasks`);
        const newTask = res.data.find((t: any) => t._id === data.taskId);
        if (newTask && !tasks.some(t => t._id === newTask._id)) {
          dispatch(addTask(newTask));
        }
      } catch {}
    });
    socket.on('task_updated', async (data: { taskId: string }) => {
      try {
        const res = await axiosInstance.get(`/tasks`);
        const updatedTask = res.data.find((t: any) => t._id === data.taskId);
        if (updatedTask) dispatch(updateTask(updatedTask));
      } catch {}
    });
    socket.on('task_deleted', (data: { taskId: string }) => {
      dispatch(deleteTask(data.taskId));
    });
    return () => {
      socket.disconnect();
      socket.off('task_created');
      socket.off('task_updated');
      socket.off('task_deleted');
    };
  }, [dispatch, user?._id, tasks]);

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
    <Box>
      <DashboardHeader title="Admin Dashboard" showNotification />
      <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <TaskForm />
        </Paper>
        <Paper elevation={2} sx={{ p: 3 }}>
          <TaskList isAdmin />
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminDashboard;