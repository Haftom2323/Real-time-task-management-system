import React, { useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import TaskForm from '../../components/Task/TaskForm';
import TaskList from '../../components/Task/TaskList';
import DashboardHeader from '../../components/DashboardHeader';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { socket } from '../../api/socket';
import axiosInstance from '../../api/axios';
import { addTask, updateTask, deleteTask } from './taskSlice';
import { addNotification } from '../../features/notifications/notificationsSlice';
import { useSnackbar } from 'notistack';


const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const { enqueueSnackbar } = useSnackbar();

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
          enqueueSnackbar('Task created: ' + newTask.title, { variant: 'info' });
          dispatch(addNotification({ message: 'Task created: ' + newTask.title, type: 'info' }));
        }
      } catch {}
    });
    socket.on('task_updated', async (data: { taskId: string }) => {
      try {
        const res = await axiosInstance.get(`/tasks`);
        const updatedTask = res.data.find((t: any) => t._id === data.taskId);
        if (updatedTask) {
          dispatch(updateTask(updatedTask));
          enqueueSnackbar(`Task "${updatedTask.title}" updated`, { variant: 'success' });
          dispatch(addNotification({ message: 'Task updated', type: 'success' }));
        }
      } catch {}
    });
    socket.on('task_deleted', (data: { taskId: string, title: string }) => {
      dispatch(deleteTask(data.taskId));
      enqueueSnackbar(`Task "${data.title}" deleted`, { variant: 'warning' });
      dispatch(addNotification({ message: 'Task deleted', type: 'warning' }));
    });
    socket.on('task_assigned', (data: { taskId: string, title: string }) => {
      enqueueSnackbar('You have been assigned a new task titled: ' + data.title, { variant: 'info' });
      dispatch(addNotification({ message: 'You have been assigned a new task!', type: 'info' }));
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