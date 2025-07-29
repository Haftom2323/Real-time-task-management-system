import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

function loadAuthState(): AuthState {
  const stored = localStorage.getItem('auth');
  if (stored) {
    try {
      return { ...JSON.parse(stored), loading: false, error: null };
    } catch {
      return { user: null, token: null, loading: false, error: null };
    }
  }
  return { user: null, token: null, loading: false, error: null };
}

const initialState: AuthState = loadAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<{ user: User; token: string }>) {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem('auth', JSON.stringify({ user: state.user, token: state.token }));
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    registerStart(state) {
      state.loading = true;
      state.error = null;
    },
    registerSuccess(state, action: PayloadAction<{ user: User }>) {
      state.loading = false;
      state.user = action.payload.user;
      state.error = null;
    },
    registerFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('auth');
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer; 