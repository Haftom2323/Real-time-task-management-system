import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import axiosInstance from '../../api/axios';
import { Box, Typography, Chip, IconButton, MenuItem, Select, CircularProgress, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchTasks, deleteTaskAsync, updateTaskAsync, addTask, updateTask, deleteTask } from '../../features/admin/taskSlice';
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

interface TaskListProps {
  isAdmin?: boolean;
  refresh?: boolean;
  onEdit?: (task: any) => void;
  loading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ isAdmin, onEdit, loading: isLoading = false }) => {
  const dispatch = useDispatch();
  const { tasks, loading: tasksLoading, filters } = useSelector((state: RootState) => state.tasks);
  const { users } = useSelector((state: RootState) => state.users);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string; assignedTo: string; status: 'pending' | 'in_progress' | 'completed' | '' }>({ title: '', description: '', assignedTo: '', status: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Use the loading prop if provided, otherwise fall back to Redux loading state
  const loading = isLoading || tasksLoading;

  useEffect(() => {
    dispatch(fetchTasks() as any);
    socket.connect();
    socket.on('task_created', async (data: { taskId: string }) => {
      try {
        const res = await axiosInstance.get(`/tasks`);
        const newTask = res.data.find((t: any) => t._id === data.taskId);
        if (newTask) dispatch(addTask(newTask));
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
  }, [dispatch]);

  // Filter tasks based on the current filters
  const filteredTasks = tasks.filter(task => {
    if (filters.status && filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }
    // Add additional filter conditions here if needed (e.g., assignedTo, search)
    return true;
  });

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      assignedTo: typeof task.assignedTo === 'object' ? task.assignedTo._id : '',
      status: (['pending', 'in_progress', 'completed'].includes(task.status) ? task.status : '') as 'pending' | 'in_progress' | 'completed' | '',
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

  const handleDelete = async (taskId: string) => {
    setDeleteId(taskId);
    await dispatch(deleteTaskAsync(taskId) as any);
    setDeleteId(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Tasks</Typography>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : filteredTasks.length === 0 ? (
        <Typography color="text.secondary" align="center" py={4}>No tasks found.</Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {filteredTasks.map(task => (
            <Paper key={task._id} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={600}>{task.title}</Typography>
                <Typography variant="body2" color="text.secondary">{task.description}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Assigned to: {typeof task.assignedTo === 'object' && task.assignedTo ? `${task.assignedTo.name} (${task.assignedTo.email})` : 'Unassigned'}
                </Typography>
              </Box>
              <Chip
                label={task.status.replace('_', ' ').toUpperCase()}
                color={statusColors[task.status] || 'default'}
                sx={{ minWidth: 110 }}
              />
              {isAdmin && (
                <>
                  <IconButton color="primary" size="small" title="Edit Task" onClick={() => handleEdit(task)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" size="small" title="Delete Task" onClick={() => handleDelete(task._id)} disabled={deleteId === task._id}>
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
            </Paper>
          ))}
        </Box>
      )}
      {/* Edit Modal */}
      <Dialog open={!!editTask} onClose={() => setEditTask(null)}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
          <TextField
            label="Title"
            name="title"
            value={editForm.title}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={editForm.description}
            onChange={handleEditChange}
            fullWidth
            multiline
            minRows={2}
          />
          <FormControl fullWidth>
            <InputLabel id="edit-assignedTo-label">Assign To</InputLabel>
            <Select
              labelId="edit-assignedTo-label"
              name="assignedTo"
              value={editForm.assignedTo}
              label="Assign To"
              onChange={handleEditChange}
            >
              {users.map(user => (
                <MenuItem key={user._id} value={user._id}>{user.name} ({user.email})</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
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
        <DialogActions>
          <Button onClick={() => setEditTask(null)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList;