import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
// import tasksReducer from '../features/tasks/taskSlice';
// import notificationsReducer from '../features/notifications/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // tasks: tasksReducer,
    // notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 