import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Link } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import {
  loginStart, loginSuccess, loginFailure,
  registerStart, registerSuccess, registerFailure
} from './authSlice';
import axiosInstance from '../../api/axios';
import { useNavigate } from 'react-router';

const AuthForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      dispatch(loginStart());
      try {
        const res = await axiosInstance.post('/auth/login', {
          email: form.email,
          password: form.password,
        });
        dispatch(loginSuccess(res.data));
        navigate('/dashboard');
      } catch (err: any) {
        dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
      }
    } else {
      dispatch(registerStart());
      try {
        const res = await axiosInstance.post('/auth/register', {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        dispatch(registerSuccess({ user: res.data }));
        setIsLogin(true);
      } catch (err: any) {
        dispatch(registerFailure(err.response?.data?.message || 'Registration failed'));
      }
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f5f6fa">
      <Paper elevation={6} sx={{ p: 4, minWidth: 350, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={700} color="primary" mb={2} align="center">
          Real-Time Task Manager
        </Typography>
        <Typography variant="h6" mb={3} align="center">
          {isLogin ? 'Sign In to your account' : 'Create a new account'}
        </Typography>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
          )}
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          {error && (
            <Typography color="error" mt={1} align="center">{error}</Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, mb: 1, fontWeight: 600 }}
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : isLogin ? 'Login' : 'Register'}
          </Button>
        </form>
        <Box mt={2} textAlign="center">
          <Link
            component="button"
            variant="body2"
            onClick={() => setIsLogin(!isLogin)}
            sx={{ fontWeight: 500 }}
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default AuthForm;