import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo?: any;
  status: 'pending' | 'in_progress' | 'completed';
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get<Task[]>('/tasks');
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
  }
});

export const fetchMyTasks = createAsyncThunk('tasks/fetchMyTasks', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get<Task[]>('/tasks/my');
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user tasks');
  }
});

export const deleteTaskAsync = createAsyncThunk('tasks/deleteTask', async (taskId: string, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/tasks/${taskId}`);
    return taskId;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete task');
  }
});

export const updateTaskAsync = createAsyncThunk('tasks/updateTask', async (task: Partial<Task> & { _id: string }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/tasks/${task._id}`, task);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update task');
  }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask(state, action: PayloadAction<Task>) {
      state.tasks.unshift(action.payload);
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter(t => t._id !== action.payload);
    },
    updateTask(state, action: PayloadAction<Task>) {
      const idx = state.tasks.findIndex(t => t._id === action.payload._id);
      if (idx !== -1) state.tasks[idx] = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
      })
      .addCase(updateTaskAsync.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t._id === action.payload._id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      });
  },
});

export const { addTask, deleteTask, updateTask } = taskSlice.actions;
export default taskSlice.reducer; 