import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import TaskList from '../../components/Task/TaskList';
import TaskFormModal from '../../components/Task/TaskFormModal';
import DashboardHeader from '../../components/DashboardHeader';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { socket } from '../../api/socket';
import axiosInstance from '../../api/axios';
import { 
  addTask, 
  updateTask, 
  deleteTask, 
  fetchTasks, 
  setFilters 
} from './taskSlice';
import { addNotification } from '../../features/notifications/notificationsSlice';
import { useSnackbar } from 'notistack';


type StatusOption = {
  value: 'all' | 'pending' | 'in_progress' | 'completed';
  label: string;
};

const statusOptions: StatusOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
];

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { tasks, loading, filters } = useSelector((state: RootState) => state.tasks);
  const { enqueueSnackbar } = useSnackbar();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openFilter = Boolean(anchorEl);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (status: 'pending' | 'in_progress' | 'completed' | 'all' | undefined) => {
    dispatch(setFilters({ status: status === 'all' ? undefined : status as 'pending' | 'in_progress' | 'completed' | undefined }));
    handleFilterClose();
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsCreateModalOpen(true);
  };
  
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingTask(null);
  };
  
  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };
  
  const handleTaskSubmit = async (taskData: any) => {
    try {
      if (editingTask) {
        const { data } = await axiosInstance.put(`/tasks/${editingTask._id}`, taskData);
        dispatch(updateTask(data));
        enqueueSnackbar('Task updated successfully', { variant: 'success' });
        handleCloseCreateModal();
      } else {
        // Step 1: Create the task
        const response = await axiosInstance.post('/tasks', taskData);
        
        try {
          // Step 2: Fetch the complete task data with populated assignedTo
          const { data } = await axiosInstance.get(`/tasks/${response.data._id}`);
          dispatch(addTask(data));
          enqueueSnackbar('Task created successfully', { variant: 'success' });
          handleCloseCreateModal();
        } catch (fetchError) {
          console.warn('Task created but failed to fetch complete data:', fetchError);
          // Still close the modal and show success since the task was created
          enqueueSnackbar('Task created successfully', { variant: 'success' });
          // Trigger a refresh of the task list to get the latest data
          dispatch(fetchTasks() as any);
          handleCloseCreateModal();
        }
      }
    } catch (error: unknown) {
      console.error('Error in task operation:', error);
      let errorMessage = 'Failed to save task';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data?: { 
              message?: string 
            } 
          } 
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  useEffect(() => {
    socket.connect();
    if (user?._id) {
      socket.emit('register', user._id);
    }
    socket.on('task_created', async (data: { taskId: string, createdBy: string }) => {
      try {
        // Don't show notification if current user created the task
        if (data.createdBy === user?._id) return;
        
        const res = await axiosInstance.get(`/tasks`);
        const newTask = res.data.find((t: any) => t._id === data.taskId);
        if (newTask && !tasks.some(t => t._id === newTask._id)) {
          dispatch(addTask(newTask));
          enqueueSnackbar('Task created: ' + newTask.title, { variant: 'info' });
          dispatch(addNotification({ message: 'Task created: ' + newTask.title, type: 'info' }));
        }
      } catch {}
    });
    socket.on('task_updated', async (data: { taskId: string, updatedBy: string }) => {
      try {
        // Don't show notification if current user updated the task
        if (data.updatedBy === user?._id) return;
        
        const res = await axiosInstance.get(`/tasks`);
        const updatedTask = res.data.find((t: any) => t._id === data.taskId);
        if (updatedTask) {
          dispatch(updateTask(updatedTask));
          enqueueSnackbar(`Task "${updatedTask.title}" updated`, { variant: 'success' });
          dispatch(addNotification({ message: 'Task updated: ' + updatedTask.title, type: 'success' }));
        }
      } catch {}
    });
    socket.on('task_deleted', (data: { taskId: string, title: string, deletedBy: string }) => {
      // Don't show notification if current user deleted the task
      if (data.deletedBy === user?._id) return;
      
      dispatch(deleteTask(data.taskId));
      enqueueSnackbar(`Task "${data.title}" deleted`, { variant: 'warning' });
      dispatch(addNotification({ message: 'Task deleted: ' + data.title, type: 'warning' }));
    });
    socket.on('task_assigned', (data: { taskId: string, title: string, assignedTo: string }) => {
      // Only show notification if assigned to current user
      if (data.assignedTo === user?._id) {
        enqueueSnackbar('You have been assigned a new task: ' + data.title, { variant: 'info' });
        dispatch(addNotification({ 
          message: 'You have been assigned a new task: ' + data.title, 
          type: 'info' 
        }));
      }
    });

    return () => {
      socket.disconnect();
      socket.off('task_created');
      socket.off('task_updated');
      socket.off('task_deleted');
      socket.off('task_assigned');
    };
  }, [dispatch, user?._id, tasks, enqueueSnackbar]);
 

  return (
    <Box>
      <DashboardHeader title="Admin Dashboard" showNotification />
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, px: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight={600}>Task Management</Typography>
            <Box display="flex" gap={2}>
              <Tooltip title="Filter tasks">
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<FilterListIcon />}
                  onClick={handleFilterClick}
                  sx={{ textTransform: 'none' }}
                >
                  {!filters.status || filters.status === 'all' ? 'Filter' : filters.status.replace('_', ' ')}
                </Button>
              </Tooltip>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateModal}
                sx={{ textTransform: 'none' }}
              >
                Create Task
              </Button>
            </Box>
          </Box>
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
                selected={filters.status === option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
        
        <Paper elevation={2} sx={{ p: 3, minHeight: 400 }}>
          <TaskList 
            isAdmin 
            onEdit={handleEditTask}
            loading={loading}
          />
        </Paper>
        
        {/* Task Form Modal */}
        <TaskFormModal
          open={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          task={editingTask}
          onSubmit={handleTaskSubmit}
          isEditing={!!editingTask}
        />
      </Box>
    </Box>
  );
};

export default AdminDashboard;