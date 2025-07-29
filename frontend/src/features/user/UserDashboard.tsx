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
  IconButton,
  Tooltip,
  Avatar,
  useTheme
} from '@mui/material';
import { 
  FilterList as FilterListIcon, 
  Edit as EditIcon, 
  Close as CloseIcon,
  CheckCircle,
  PendingActions,
  AssignmentTurnedIn
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

type TaskStatus = 'pending' | 'in_progress' | 'completed';

const statusIcons = {
  pending: <PendingActions fontSize="small" />,
  in_progress: <EditIcon fontSize="small" />,
  completed: <CheckCircle fontSize="small" />
};

const statusLabels: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed'
};

const UserDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const user = useSelector((state: RootState) => state.auth.user);
  const { enqueueSnackbar } = useSnackbar();
  
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
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
    
    const handleTaskCreated = (data: { title: string, createdBy: string }) => {
      if (data.createdBy !== user?._id) {
        enqueueSnackbar(`Task "${data.title}" created`, { variant: 'info' });
        dispatch(addNotification({ 
          message: 'Task created: ' + data.title, 
          type: 'info' 
        }));
        dispatch(fetchMyTasks() as any);
      }
    };
    
    const handleTaskUpdated = (data: { title: string, updatedBy: string }) => {
      if (data.updatedBy !== user?._id) {
        enqueueSnackbar(`Task "${data.title}" was updated`, { variant: 'success' });
        dispatch(addNotification({ 
          message: 'Task updated: ' + data.title, 
          type: 'success' 
        }));
        dispatch(fetchMyTasks() as any);
      }
    };
    
    const handleTaskDeleted = (data: { title: string, deletedBy: string }) => {
      if (data.deletedBy !== user?._id) {
        enqueueSnackbar(`Task "${data.title}" was deleted`, { variant: 'warning' });
        dispatch(addNotification({ 
          message: 'Task deleted: ' + data.title, 
          type: 'warning' 
        }));
        dispatch(fetchMyTasks() as any);
      }
    };
    
    const handleTaskAssigned = (data: { title: string, assignedTo: string }) => {
      if (data.assignedTo === user?._id) {
        enqueueSnackbar(`You have been assigned task "${data.title}"`, { variant: 'info' });
        dispatch(addNotification({ 
          message: 'You have been assigned a new task: ' + data.title, 
          type: 'info' 
        }));
        dispatch(fetchMyTasks() as any);
      }
    };

    socket.on('task_created', handleTaskCreated);
    socket.on('task_updated', handleTaskUpdated);
    socket.on('task_deleted', handleTaskDeleted);
    socket.on('task_assigned', handleTaskAssigned);
    
    return () => {
      socket.disconnect();
      socket.off('task_created', handleTaskCreated);
      socket.off('task_updated', handleTaskUpdated);
      socket.off('task_deleted', handleTaskDeleted);
      socket.off('task_assigned', handleTaskAssigned);
    };
  }, [dispatch, user?._id, enqueueSnackbar]);

  const handleStatusChange = (taskId: string, status: 'pending' | 'in_progress' | 'completed') => {
    dispatch(updateTaskAsync({ _id: taskId, status }) as any);
    setEditingTaskId(null);
    enqueueSnackbar(`Task status updated to ${statusLabels[status]}`, { variant: 'success' });
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
  
  const handleFilterSelect = (status: TaskStatus | 'all') => {
    setStatusFilter(status);
    handleFilterClose();
  };
  
  const statusOptions: Array<{ value: TaskStatus | 'all', label: string, icon: React.ReactNode }> = [
    { value: 'all', label: 'All Statuses', icon: <AssignmentTurnedIn /> },
    { value: 'pending', label: 'Pending', icon: <PendingActions /> },
    { value: 'in_progress', label: 'In Progress', icon: <EditIcon /> },
    { value: 'completed', label: 'Completed', icon: <CheckCircle /> }
  ];

  return (
    <Box sx={{ 
      background: theme.palette.mode === 'light' 
        ? 'linear-gradient(45deg, #f5f7fa 0%, #e4edf5 100%)' 
        : 'linear-gradient(45deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      minHeight: '100vh',
      pb: 6
    }}>
      <DashboardHeader title="Real-time Task Management" showNotification />
      
      <Box sx={{ 
        maxWidth: 1200, 
        mx: 'auto', 
        mt: 4, 
        px: 2,
        animation: 'fadeIn 0.5s ease-in'
      }}>
        <Box 
          sx={{ 
            bgcolor: 'background.paper', 
            borderRadius: 4,
            p: 4,
            boxShadow: 3,
            mb: 4
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main' }}>
                Your Tasks Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Real-time updates for your assigned tasks
              </Typography>
            </Box>
            
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FilterListIcon />}
                onClick={handleFilterClick}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 20,
                  px: 3,
                  py: 1,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {statusFilter === 'all' ? 'Filter Tasks' : statusLabels[statusFilter]}
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
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    mt: 1,
                    boxShadow: 4
                  }
                }}
              >
                {statusOptions.map((option) => (
                  <MenuItem 
                    key={option.value} 
                    onClick={() => handleFilterSelect(option.value)}
                    selected={statusFilter === option.value}
                    sx={{
                      minWidth: 200,
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box sx={{ color: statusFilter === option.value ? 'inherit' : 'action.active' }}>
                        {option.icon}
                      </Box>
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>
          
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress size={60} />
            </Box>
          ) : filteredTasks.length === 0 ? (
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: 'background.default'
            }}>
              <Box sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }}>
                <AssignmentTurnedIn fontSize="inherit" />
              </Box>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {statusFilter === 'all' 
                  ? 'No tasks assigned to you yet' 
                  : `No ${statusLabels[statusFilter] || statusFilter} tasks`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {statusFilter === 'all' 
                  ? "You'll see tasks here when they're assigned to you" 
                  : "Tasks with this status will appear here"}
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)'
                },
                gap: 3
              }}
            >
              {filteredTasks.map(task => (
                <Paper 
                  key={task._id} 
                  sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 1.5,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                    backgroundColor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6,
                      borderLeft: `4px solid ${theme.palette.secondary.main}`
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.primary.main, 
                        color: 'white',
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        mr: 2
                      }}
                    >
                      {task.title.charAt(0)}
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>
                      {task.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    minHeight: 60,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2
                  }}>
                    {task.description || 'No description provided'}
                  </Typography>
                  
                  <Box mt="auto">
                    {editingTaskId === task._id ? (
                      <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                        {(['pending', 'in_progress', 'completed'] as TaskStatus[]).map((status) => (
                          <Chip
                            key={status}
                            label={statusLabels[status]}
                            color={statusColors[status] as any}
                            variant={status === task.status ? 'filled' : 'outlined'}
                            onClick={() => handleStatusChange(task._id, status)}
                            sx={{ 
                              cursor: 'pointer',
                              borderRadius: 1,
                              fontWeight: 600
                            }}
                            icon={statusIcons[status]}
                          />
                        ))}
                        <IconButton 
                          size="small" 
                          onClick={() => setEditingTaskId(null)}
                          color="inherit"
                          sx={{ ml: 'auto' }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Chip
                          label={statusLabels[task.status]}
                          color={statusColors[task.status] as any}
                          size="medium"
                          sx={{ 
                            fontWeight: 600,
                            px: 1.5,
                            py: 1,
                            borderRadius: 1,
                            '&:hover': {
                              opacity: 0.9,
                            }
                          }}
                          icon={statusIcons[task.status]}
                        />
                        <Tooltip title="Update status">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditClick(task._id)}
                            color="primary"
                            sx={{ 
                              bgcolor: 'action.hover',
                              '&:hover': {
                                bgcolor: 'primary.light',
                                color: 'primary.contrastText'
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      
      </Box>
    </Box>
  );
};

export default UserDashboard;