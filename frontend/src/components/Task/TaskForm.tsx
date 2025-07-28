import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axios';
import { Box, Button, TextField, Typography, MenuItem, CircularProgress, Select, InputLabel, FormControl } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { fetchUsers } from '../../features/user/userSlice';

interface TaskFormProps {
  onSuccess?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { users, loading: usersLoading } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers() as any);
    }
  }, [dispatch, users.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/tasks', {
        title,
        description,
        assignedTo,
      });
      setTitle('');
      setDescription('');
      setAssignedTo('');
      if (onSuccess) onSuccess();
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" fontWeight={600}>Create New Task</Typography>
      <TextField
        label="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        fullWidth
      />
      <FormControl fullWidth required>
        <InputLabel id="assignedTo-label">Assign To</InputLabel>
        <Select
          labelId="assignedTo-label"
          value={assignedTo}
          label="Assign To"
          onChange={e => setAssignedTo(e.target.value)}
          disabled={usersLoading}
        >
          {users.map(user => (
            <MenuItem key={user._id} value={user._id}>{user.name} ({user.email})</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        multiline
        minRows={2}
        fullWidth
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ alignSelf: 'flex-end', minWidth: 120 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Create Task'}
      </Button>
    </Box>
  );
};

export default TaskForm;