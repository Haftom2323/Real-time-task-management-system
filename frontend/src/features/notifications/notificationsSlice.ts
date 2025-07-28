import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  seen: boolean;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
};

let notificationId = 0;

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<{ message: string; type: Notification['type'] }>
    ) => {
      state.notifications.unshift({
        id: String(++notificationId),
        message: action.payload.message,
        type: action.payload.type,
        seen: false,
      });
      state.unreadCount += 1;
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => (n.seen = true));
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAllAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;