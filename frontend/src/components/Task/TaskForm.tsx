import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  MenuItem, 
  CircularProgress, 
  Select, 
  InputLabel, 
  FormControl,
  Stack,
  FormHelperText
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { fetchUsers } from '../../features/user/userSlice';
import type { Task, UserRef } from '../../features/admin/taskSlice';

interface TaskFormData {
  title: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface TaskFormProps {
  initialValues?: Task | null;
  onSubmit: (taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void> | void;
  onCancel?: () => void;
  isEditing?: boolean;
  loading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    assignedTo: typeof initialValues?.assignedTo === 'string' 
      ? initialValues.assignedTo 
      : initialValues?.assignedTo?._id || '',
    status: isEditing ? (initialValues?.status || 'pending') : 'pending'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dispatch = useDispatch();
  const { users, loading: usersLoading } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers() as any);
    }
  }, [dispatch, users.length]);

  useEffect(() => {
    if (initialValues) {
      setFormData({
        title: initialValues.title || '',
        description: initialValues.description || '',
        assignedTo: typeof initialValues.assignedTo === 'string' 
          ? initialValues.assignedTo 
          : initialValues.assignedTo?._id || '',
        status: initialValues.status || 'pending'
      });
    }
  }, [initialValues]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.assignedTo) newErrors.assignedTo = 'Please assign the task to a user';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target as { name: keyof TaskFormData; value: string };
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const taskData = {
        ...formData,
        ...(isEditing && initialValues ? { _id: initialValues._id } : {})
      };
      await onSubmit(taskData);
    } catch (error) {
      console.error('Error submitting task:', error);
      setErrors({
        form: 'Failed to save task. Please try again.'
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
      {errors.form && (
        <FormHelperText error sx={{ mb: 1 }}>
          {errors.form}
        </FormHelperText>
      )}
      
      <TextField
        name="title"
        label="Title"
        value={formData.title}
        onChange={handleChange}
        required
        fullWidth
        error={!!errors.title}
        helperText={errors.title}
      />
      
      <FormControl fullWidth required error={!!errors.assignedTo}>
        <InputLabel id="assignedTo-label">Assign To</InputLabel>
        <Select
          name="assignedTo"
          labelId="assignedTo-label"
          value={formData.assignedTo}
          label="Assign To"
          onChange={handleChange}
          disabled={usersLoading}
        >
          {users.map((user: UserRef) => (
            <MenuItem key={user._id} value={user._id}>
              {user.name} ({user.email})
            </MenuItem>
          ))}
        </Select>
        {errors.assignedTo && (
          <FormHelperText>{errors.assignedTo}</FormHelperText>
        )}
      </FormControl>
      {isEditing && (
        <FormControl fullWidth>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            name="status"
            labelId="status-label"
            value={formData.status}
            label="Status"
            onChange={handleChange}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
      )}

      <TextField
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
        multiline
        minRows={3}
        fullWidth
      />
      
      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
        {onCancel && (
          <Button 
            onClick={onCancel} 
            variant="outlined"
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={24} /> : isEditing ? 'Update Task' : 'Create Task'}
        </Button>
      </Stack>
    </Box>
  );
};

export default TaskForm;