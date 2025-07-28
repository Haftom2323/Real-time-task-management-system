import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { fetchMyTasks, updateTaskAsync } from '../admin/taskSlice';
import { Box, Typography, Paper, Chip, Select, MenuItem, CircularProgress } from '@mui/material';
import DashboardHeader from '../../components/DashboardHeader';
import { socket } from '../../api/socket';

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
  pending: 'warning',
  in_progress: 'primary',
  completed: 'success',
};

const UserDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    dispatch(fetchMyTasks() as any);
    socket.connect();
    if (user?._id) {
      socket.emit('register', user._id);
    }
    socket.on('task_created', () => {
      dispatch(fetchMyTasks() as any);
    });
    socket.on('task_updated', () => {
      dispatch(fetchMyTasks() as any);
    });
    socket.on('task_deleted', () => {
      dispatch(fetchMyTasks() as any);
    });
    return () => {
      socket.disconnect();
      socket.off('task_created');
      socket.off('task_updated');
      socket.off('task_deleted');
    };
  }, [dispatch, user?._id]);

  const handleStatusChange = (taskId: string, status: 'pending' | 'in_progress' | 'completed') => {
    dispatch(updateTaskAsync({ _id: taskId, status }) as any);
  };

  return (
    <Box>
      <DashboardHeader title="User Dashboard" />
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>My Tasks</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
        ) : tasks.length === 0 ? (
          <Typography color="text.secondary" align="center" py={4}>No tasks assigned to you.</Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {tasks.map(task => (
              <Paper key={task._id} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={600}>{task.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{task.description}</Typography>
                </Box>
                <Select
                  size="small"
                  value={task.status}
                  onChange={e => handleStatusChange(task._id, e.target.value as 'pending' | 'in_progress' | 'completed')}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
                <Chip
                  label={task.status.replace('_', ' ').toUpperCase()}
                  color={statusColors[task.status] || 'default'}
                  sx={{ minWidth: 110 }}
                />
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UserDashboard;