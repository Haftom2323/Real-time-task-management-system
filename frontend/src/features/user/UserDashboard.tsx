import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { fetchMyTasks, updateTaskAsync } from '../admin/taskSlice';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  Button, 
  CircularProgress, 
  Menu, 
  MenuItem, 
  TextField, 
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  FilterList as FilterListIcon, 
  Edit as EditIcon, 
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import DashboardHeader from '../../components/DashboardHeader';
import { socket } from '../../api/socket';
import { useSnackbar } from 'notistack';
import { addNotification } from '../../features/notifications/notificationsSlice';

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
  pending: 'warning',
  in_progress: 'primary',
  completed: 'success',
};

const UserDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const user = useSelector((state: RootState) => state.auth.user);
  const { enqueueSnackbar } = useSnackbar();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openFilter = Boolean(anchorEl);
  
  const filteredTasks = tasks.filter(task => 
    statusFilter === 'all' ? true : task.status === statusFilter
  );

  useEffect(() => {
    dispatch(fetchMyTasks() as any);
    socket.connect();
    if (user?._id) {
      socket.emit('register', user._id);
    }
    socket.on('task_created', (data: { title: string, createdBy: string }) => {
      // Only show notification if the task wasn't created by the current user
      if (data.createdBy !== user?._id) {
        enqueueSnackbar(`Task "${data.title}" created and assigned to you`, { variant: 'info' });
        dispatch(addNotification({ 
          message: 'Task created: ' + data.title, 
          type: 'info' 
        }));
        dispatch(fetchMyTasks() as any);
      }
    });
    socket.on('task_updated', (data: { title: string, updatedBy: string }) => {
      // Only show notification if the task wasn't updated by the current user
      if (data.updatedBy !== user?._id) {
        enqueueSnackbar(`Task "${data.title}" was updated`, { variant: 'success' });
        dispatch(addNotification({ 
          message: 'Task updated: ' + data.title, 
          type: 'success' 
        }));
        dispatch(fetchMyTasks() as any);
      }
    });
    socket.on('task_deleted', (data: { title: string, deletedBy: string }) => {
      // Only show notification if the task wasn't deleted by the current user
      if (data.deletedBy !== user?._id) {
        enqueueSnackbar(`Task "${data.title}" was deleted`, { variant: 'warning' });
        dispatch(addNotification({ 
          message: 'Task deleted: ' + data.title, 
          type: 'warning' 
        }));
        dispatch(fetchMyTasks() as any);
      }
    });
    socket.on('task_assigned', (data: { title: string, assignedTo: string }) => {
      // Only show notification if assigned to current user
      if (data.assignedTo === user?._id) {
        enqueueSnackbar(`You have been assigned task "${data.title}"`, { variant: 'info' });
        dispatch(addNotification({ 
          message: 'You have been assigned a new task: ' + data.title, 
          type: 'info' 
        }));
        dispatch(fetchMyTasks() as any);
      }
    });

    return () => {
      socket.disconnect();
      socket.off('task_created');
      socket.off('task_updated');
      socket.off('task_deleted');
      socket.off('task_assigned');
    };
  }, [dispatch, user?._id, enqueueSnackbar]);

  const handleStatusChange = (taskId: string, status: 'pending' | 'in_progress' | 'completed') => {
    dispatch(updateTaskAsync({ _id: taskId, status }) as any);
    setEditingTaskId(null);
  };
  
  const handleEditClick = (taskId: string) => {
    setEditingTaskId(taskId);
  };
  
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setAnchorEl(null);
  };
  
  const handleFilterSelect = (status: string) => {
    setStatusFilter(status);
    handleFilterClose();
  };
  
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  return (
    <Box>
      <DashboardHeader title="My Tasks" showNotification /> 
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={600}>My Tasks</Typography>
          <Box>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<FilterListIcon />}
              onClick={handleFilterClick}
              sx={{ textTransform: 'none' }}
            >
              {statusFilter === 'all' ? 'Filter' : statusFilter.replace('_', ' ')}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={openFilter}
              onClose={handleFilterClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {statusOptions.map((option) => (
                <MenuItem 
                  key={option.value} 
                  onClick={() => handleFilterSelect(option.value)}
                  selected={statusFilter === option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
        ) : filteredTasks.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {statusFilter === 'all' 
                ? 'No tasks assigned to you.' 
                : `No tasks with status "${statusFilter.replace('_', ' ')}"`}
            </Typography>
          </Paper>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {filteredTasks.map(task => (
              <Paper 
                key={task._id} 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 3,
                  }
                }}
              >
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {task.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {task.description || 'No description'}
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {editingTaskId === task._id ? (
                      <Box display="flex" gap={1} alignItems="center">
                        {['pending', 'in_progress', 'completed'].map((status) => (
                          <Chip
                            key={status}
                            label={status.replace('_', ' ').toUpperCase()}
                            color={status === task.status ? (statusColors[status] as any) : 'default'}
                            variant={status === task.status ? 'filled' : 'outlined'}
                            onClick={() => handleStatusChange(task._id, status as any)}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                        <IconButton 
                          size="small" 
                          onClick={() => setEditingTaskId(null)}
                          color="inherit"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <>
                        <Chip
                          label={task.status.replace('_', ' ').toUpperCase()}
                          color={statusColors[task.status] || 'default'}
                          size="small"
                          sx={{ 
                            minWidth: 100,
                            '&:hover': {
                              opacity: 0.8,
                            }
                          }}
                        />
                        <Tooltip title="Edit status">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditClick(task._id)}
                            color="primary"
                            sx={{ ml: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </Box>
                {editingTaskId !== task._id && (
                  <Chip
                    label={task.status.replace('_', ' ')}
                    color={
                      task.status === 'completed' 
                        ? 'success' 
                        : task.status === 'in_progress' 
                        ? 'primary' 
                        : 'default'
                    }
                    variant="outlined"
                    size="small"
                  />
                )}
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UserDashboard;