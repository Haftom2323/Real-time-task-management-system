import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  CircularProgress, 
  Link, 
  IconButton,
  InputAdornment,
  Fade,
  Alert,
  Divider
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import {
  loginStart, loginSuccess, loginFailure,
  registerStart, registerSuccess, registerFailure,
  clearError
} from './authSlice';
import axiosInstance from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const AuthForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false
  });

  // Clear error when switching between login/register
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [isLogin, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) dispatch(clearError());
    setForm({ ...form, [e.target.name]: e.target.value });
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const getError = (field: keyof typeof form) => {
    if (!touched[field]) return '';
    if (!form[field]) return 'This field is required';
    if (field === 'email' && !/\S+@\S+\.\S+/.test(form.email)) {
      return 'Please enter a valid email';
    }
    if (field === 'password' && form.password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const isFormValid = () => {
    if (!form.email || !form.password) return false;
    if (!isLogin && !form.name) return false;
    if (getError('email') || getError('password') || (!isLogin && getError('name'))) return false;
    return true;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 3, sm: 4 },
        width: '100%',
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
      }}
    >
      <Box textAlign="center" mb={3}>
        <Typography 
          variant="h5" 
          component="h2" 
          fontWeight={700}
          color="text.primary"
          gutterBottom
        >
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isLogin ? 'Sign in to continue to your account' : 'Get started with your account'}
        </Typography>
      </Box>

      {error && (
        <Fade in={!!error}>
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        </Fade>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {!isLogin && (
          <TextField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            error={touched.name && !!getError('name')}
            helperText={touched.name && getError('name')}
            fullWidth
            margin="normal"
            variant="outlined"
            autoComplete="name"
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderWidth: 1,
                },
              },
            }}
          />
        )}

        <TextField
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={() => handleBlur('email')}
          error={touched.email && !!getError('email')}
          helperText={touched.email && getError('email')}
          fullWidth
          margin="normal"
          variant="outlined"
          autoComplete="email"
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderWidth: 1,
              },
            },
          }}
        />

        <TextField
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={handleChange}
          onBlur={() => handleBlur('password')}
          error={touched.password && !!getError('password')}
          helperText={touched.password && getError('password')}
          fullWidth
          margin="normal"
          variant="outlined"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={togglePasswordVisibility}
                  edge="end"
                  size="large"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderWidth: 1,
              },
            },
          }}
        />

        {isLogin && (
          <Box textAlign="right" mb={2}>
            <Link
              href="#"
              variant="body2"
              color="primary"
              underline="hover"
              onClick={(e) => {
                e.preventDefault();
                // Handle forgot password
              }}
            >
              Forgot password?
            </Link>
          </Box>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={loading || !isFormValid()}
          sx={{
            mt: 2,
            mb: 2,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.39)',
            '&:hover': {
              boxShadow: '0 6px 20px 0 rgba(0, 118, 255, 0.5)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isLogin ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </Button>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2" color="text.secondary">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Link
              component="button"
              type="button"
              color="primary"
              onClick={() => setIsLogin(!isLogin)}
              sx={{
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'none',
                },
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default AuthForm;