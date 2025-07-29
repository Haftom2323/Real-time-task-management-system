import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box } from '@mui/material';
import TaskForm from './TaskForm';
import type { Task } from '../../features/admin/taskSlice';

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  onSubmit: (taskData: any) => void;
  isEditing?: boolean;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  open,
  onClose,
  task = null,
  onSubmit,
  isEditing = false
}) => {
  const handleSubmit = (taskData: any) => {
    onSubmit(taskData);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <TaskForm 
          initialValues={task} 
          onSubmit={handleSubmit} 
          onCancel={onClose}
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormModal;
