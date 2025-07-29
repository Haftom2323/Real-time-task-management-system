import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import axiosInstance from '../../api/axios';
import { 
  Box, 
  Typography, 
  Chip, 
  IconButton, 
  MenuItem, 
  Select, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel,
  Avatar,
  useTheme
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchTasks, deleteTaskAsync, updateTaskAsync, addTask, updateTask, deleteTask } from '../../features/admin/taskSlice';
import ConfirmationDialog from '../common/ConfirmationDialog';
import { socket } from '../../api/socket';

interface UserRef {
  _id: string;
  name: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo?: UserRef | string;
  status: string;
}

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
  pending: 'warning',
  in_progress: 'primary',
  completed: 'success',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

interface TaskListProps {
  isAdmin?: boolean;
  refresh?: boolean;
  onEdit?: (task: any) => void;
  loading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ isAdmin, loading: isLoading = false }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { tasks, loading: tasksLoading, filters } = useSelector((state: RootState) => state.tasks);
  const { users } = useSelector((state: RootState) => state.users);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string; assignedTo: string; status: 'pending' | 'in_progress' | 'completed' | '' }>({ title: '', description: '', assignedTo: '', status: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  const loading = isLoading || tasksLoading;

  useEffect(() => {
    dispatch(fetchTasks() as any);
    socket.connect();
    
    const handleTaskCreated = async (data: { taskId: string }) => {
      try {
        const res = await axiosInstance.get(`/tasks`);
        const newTask = res.data.find((t: any) => t._id === data.taskId);
        if (newTask) dispatch(addTask(newTask));
      } catch {}
    };
    
    const handleTaskUpdated = async (data: { taskId: string }) => {
      try {
        const res = await axiosInstance.get(`/tasks`);
        const updatedTask = res.data.find((t: any) => t._id === data.taskId);
        if (updatedTask) dispatch(updateTask(updatedTask));
      } catch {}
    };
    
    const handleTaskDeleted = (data: { taskId: string }) => {
      dispatch(deleteTask(data.taskId));
    };

    socket.on('task_created', handleTaskCreated);
    socket.on('task_updated', handleTaskUpdated);
    socket.on('task_deleted', handleTaskDeleted);
    
    return () => {
      socket.disconnect();
      socket.off('task_created', handleTaskCreated);
      socket.off('task_updated', handleTaskUpdated);
      socket.off('task_deleted', handleTaskDeleted);
    };
  }, [dispatch]);

  const filteredTasks = tasks.filter(task => {
    if (filters.status && filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }
    return true;
  });

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      assignedTo: typeof task.assignedTo === 'object' ? task.assignedTo._id : '',
      status: (['pending', 'in_progress', 'completed'].includes(task.status) 
        ? task.status 
        : '') as 'pending' | 'in_progress' | 'completed' | '',
    });
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<{ name?: string; value: unknown }> | SelectChangeEvent
  ) => {
    const target = e.target as HTMLInputElement | { name?: string; value: unknown };
    const name = target.name as string;
    const value = target.value;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (editTask) {
      await dispatch(updateTaskAsync({
        _id: editTask._id,
        title: editForm.title,
        description: editForm.description,
        assignedTo: editForm.assignedTo,
        status: editForm.status === '' ? undefined : editForm.status,
      }) as any);
      setEditTask(null);
    }
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      setDeleteId(taskToDelete);
      await dispatch(deleteTaskAsync(taskToDelete) as any);
      setDeleteId(null);
      setTaskToDelete(null);
      setConfirmDialogOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setTaskToDelete(null);
  };

  // Function to get user initials
  const getUserInitials = (name: string) => {
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Box sx={{ width: '100%' }}>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : filteredTasks.length === 0 ? (
        <Typography color="text.secondary" align="center" py={4}>
          No tasks found.
        </Typography>
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
          {filteredTasks.map(task => {
            const assignedUser = typeof task.assignedTo === 'object' ? task.assignedTo : null;
            return (
              <Box
                key={task._id}
                sx={{
                  p: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: theme.shadows[1],
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-2px)',
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Chip
                    label={statusLabels[task.status] || task.status.replace('_', ' ')}
                    color={statusColors[task.status] || 'default'}
                    size="small"
                    sx={{ 
                      fontWeight: 600, 
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem'
                    }}
                  />
                  {isAdmin && (
                    <Box sx={{ ml: 'auto' }}>
                      <IconButton 
                        color="primary" 
                        size="small" 
                        title="Edit Task" 
                        onClick={() => handleEdit(task)}
                        sx={{ 
                          backgroundColor: theme.palette.action.hover,
                          '&:hover': { backgroundColor: theme.palette.primary.light }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small" 
                        title="Delete Task" 
                        onClick={() => handleDeleteClick(task._id)} 
                        disabled={deleteId === task._id}
                        sx={{ 
                          ml: 1,
                          backgroundColor: theme.palette.action.hover,
                          '&:hover': { backgroundColor: theme.palette.error.light }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                
                <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>
                  {task.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ 
                  minHeight: 40,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {task.description}
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mt: 2,
                  pt: 1.5,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 1, mr: 1
                  }}>
                    <b>Assigned to:</b>
                  </Typography>
                  {assignedUser ? (
                    <>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          fontSize: '0.8rem',
                          bgcolor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText
                        }}
                      >
                        {getUserInitials(assignedUser.name)}
                      </Avatar>
                      <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
                        <Typography variant="caption" fontWeight={600} noWrap>
                          {assignedUser.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" noWrap>
                          {assignedUser.email}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Unassigned
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Edit Modal */}
      <Dialog open={!!editTask} onClose={() => setEditTask(null)}>
        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
          Edit Task
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400, pt: 3 }}>
          <TextField
            label="Title"
            name="title"
            value={editForm.title}
            onChange={handleEditChange}
            fullWidth
            margin="dense"
            variant="outlined"
          />
          <TextField
            label="Description"
            name="description"
            value={editForm.description}
            onChange={handleEditChange}
            fullWidth
            multiline
            minRows={3}
            margin="dense"
            variant="outlined"
          />
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel id="edit-assignedTo-label">Assign To</InputLabel>
            <Select
              labelId="edit-assignedTo-label"
              name="assignedTo"
              value={editForm.assignedTo}
              label="Assign To"
              onChange={handleEditChange}
            >
              {users.map(user => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel id="edit-status-label">Status</InputLabel>
            <Select
              labelId="edit-status-label"
              name="status"
              value={editForm.status}
              label="Status"
              onChange={handleEditChange}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditTask(null)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        content="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Box>
  );
};

export default TaskList;