import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography,
  Menu,
  MenuItem,
  Drawer,
  CssBaseline,
  AppBar,
  Toolbar,
  useTheme,
  IconButton,
  Avatar,
  Stack,
  Chip,
  Divider,
  Paper,
  Button
} from '@mui/material';
import { 
  Add as AddIcon,
  FilterList as FilterListIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { socket } from '../../api/socket';
import Sidebar from '../../components/Sidebar/Sidebar';
import TaskList from '../../components/Task/TaskList';
import TaskFormModal from '../../components/Task/TaskFormModal';
import UserList from './UserList';
import axiosInstance from '../../api/axios';
import { 
  addTask, 
  updateTask, 
  deleteTask, 
  fetchTasks, 
  setFilters 
} from './taskSlice';
import { addNotification } from '../../features/notifications/notificationsSlice';
import { useSnackbar } from 'notistack';
import { logout } from '../../features/auth/authSlice';
import NotificationDrawer from '../../components/Notification/NotificationDrawer';

type StatusOption = {
  value: 'all' | 'pending' | 'in_progress' | 'completed';
  label: string;
};

const statusOptions: StatusOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
];

const drawerWidth = 240;

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const user = useSelector((state: RootState) => state.auth.user);
  const { tasks, loading, filters } = useSelector((state: RootState) => state.tasks);
  const { enqueueSnackbar } = useSnackbar();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  
  const openFilter = Boolean(filterAnchorEl);
  const openProfile = Boolean(anchorEl);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };



  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterSelect = (status: 'pending' | 'in_progress' | 'completed' | 'all' | undefined) => {
    dispatch(setFilters({ status: status === 'all' ? undefined : status as 'pending' | 'in_progress' | 'completed' | undefined }));
    handleFilterClose();
  };

  const drawer = (
    <div>
      <Toolbar 
        sx={{ 
          minHeight: '64px !important',
          display: { xs: 'none', sm: 'flex' },
        }}
      />
      <Divider />
      <Sidebar />
    </div>
  );

  const container = window !== undefined ? () => window.document.body : undefined;


  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };

  const handleTaskSubmit = async (taskData: any) => {
    try {
      if (editingTask) {
        const { data } = await axiosInstance.put(`/tasks/${editingTask._id}`, taskData);
        dispatch(updateTask(data));
        enqueueSnackbar('Task updated successfully', { variant: 'success' });
        handleCloseCreateModal();
      } else {
        // Step 1: Create the task
        const response = await axiosInstance.post('/tasks', taskData);
        
        try {
          // Step 2: Fetch the complete task data with populated assignedTo
          const { data } = await axiosInstance.get(`/tasks/${response.data._id}`);
          dispatch(addTask(data));
          enqueueSnackbar('Task created successfully', { variant: 'success' });
          handleCloseCreateModal();
        } catch (fetchError) {
          console.warn('Task created but failed to fetch complete data:', fetchError);
          // Still close the modal and show success since the task was created
          enqueueSnackbar('Task created successfully', { variant: 'success' });
          // Trigger a refresh of the task list to get the latest data
          dispatch(fetchTasks() as any);
          handleCloseCreateModal();
        }
      }
    } catch (error: unknown) {
      console.error('Error in task operation:', error);
      let errorMessage = 'Failed to save task';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data?: { 
              message?: string 
            } 
          } 
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  useEffect(() => {
    socket.connect();
    if (user?._id) {
      socket.emit('register', user._id);
    }
    socket.on('task_created', async (data: { taskId: string, createdBy: string }) => {
      try {
        // Don't show notification if current user created the task
        if (data.createdBy === user?._id) return;
        
        const res = await axiosInstance.get(`/tasks`);
        const newTask = res.data.find((t: any) => t._id === data.taskId);
        if (newTask && !tasks.some(t => t._id === newTask._id)) {
          dispatch(addTask(newTask));
          enqueueSnackbar('Task created: ' + newTask.title, { variant: 'info' });
          dispatch(addNotification({ message: 'Task created: ' + newTask.title, type: 'info' }));
        }
      } catch {}
    });
    socket.on('task_updated', async (data: { taskId: string, updatedBy: string }) => {
      try {
        // Don't show notification if current user updated the task
        if (data.updatedBy === user?._id) return;
        
        const res = await axiosInstance.get(`/tasks`);
        const updatedTask = res.data.find((t: any) => t._id === data.taskId);
        if (updatedTask) {
          dispatch(updateTask(updatedTask));
          enqueueSnackbar(`Task "${updatedTask.title}" updated`, { variant: 'success' });
          dispatch(addNotification({ message: 'Task updated: ' + updatedTask.title, type: 'success' }));
        }
      } catch {}
    });
    socket.on('task_deleted', (data: { taskId: string, title: string, deletedBy: string }) => {
      // Don't show notification if current user deleted the task
      if (data.deletedBy === user?._id) return;
      
      dispatch(deleteTask(data.taskId));
      enqueueSnackbar(`Task "${data.title}" deleted`, { variant: 'warning' });
      dispatch(addNotification({ message: 'Task deleted: ' + data.title, type: 'warning' }));
    });
    socket.on('task_assigned', (data: { taskId: string, title: string, assignedTo: string }) => {
      // Only show notification if assigned to current user
      if (data.assignedTo === user?._id) {
        enqueueSnackbar('You have been assigned a new task: ' + data.title, { variant: 'info' });
        dispatch(addNotification({ 
          message: 'You have been assigned a new task: ' + data.title, 
          type: 'info' 
        }));
      }
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
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <CssBaseline />
      
      {/* Sidebar with primary color */}
      <Box
        component="nav"
        sx={{ 
          width: { sm: drawerWidth },
          flexShrink: 0,
          position: 'fixed',
          height: '100vh',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRight: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
          ml: { sm: `${drawerWidth}px` },
          maxWidth: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {/* Top App Bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {location.pathname.includes('users') ? 'User Management' : 'Real-TimeTask Management'}
            </Typography>
            
            <Stack direction="row" spacing={2} alignItems="center">
              <NotificationDrawer />
              
              <Chip
                avatar={
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                }
                label={user?.name || 'User'}
                variant="outlined"
                onClick={handleProfileMenuOpen}
                aria-controls={openProfile ? 'profile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openProfile ? 'true' : undefined}
                id="profile-button"
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              />
              
              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={openProfile}
                onClose={handleProfileMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.16))',
                      mt: 1.5,
                      minWidth: 180,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  },
                }}
              >
                <MenuItem onClick={handleProfileMenuClose}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: theme.palette.primary.main }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  {user?.name || 'User'}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ 
          flex: 1, 
          p: 3, 
          bgcolor: 'background.default',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}>
          <Routes>
            <Route
              path="/"
              element={
                <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                  <Paper elevation={0} sx={{ p: 3, minHeight: 400 }}>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
                          Tasks
                        </Typography>
                        <Chip 
                          label={`${tasks.length} tasks`} 
                          size="small" 
                          variant="outlined" 
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={filters.status ? statusOptions.find(opt => opt.value === filters.status)?.label : 'All Statuses'} 
                          size="small" 
                          variant="outlined"
                          onClick={handleFilterClick}
                          deleteIcon={<FilterListIcon fontSize="small" />}
                          onDelete={handleFilterClick}
                        />
                        <Menu
                          id="filter-menu"
                          anchorEl={filterAnchorEl}
                          open={openFilter}
                          onClose={handleFilterClose}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                        >
                          {statusOptions.map((option) => (
                            <MenuItem
                              key={option.value}
                              onClick={() => handleFilterSelect(option.value)}
                              selected={filters.status === option.value || (!filters.status && option.value === 'all')}
                            >
                              {option.label}
                            </MenuItem>
                          ))}
                        </Menu>
                      </Box>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setEditingTask(null);
                          setIsCreateModalOpen(true);
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        New Task
                      </Button>
                    </Box>
                    
                    <TaskList 
                      isAdmin 
                      onEdit={handleEditTask}
                      loading={loading}
                    />
                  </Paper>
                </Box>
              }
            />
            <Route path="/users" element={<UserList />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          {/* Task Form Modal */}
          <TaskFormModal
            open={isCreateModalOpen}
            onClose={handleCloseCreateModal}
            task={editingTask}
            onSubmit={handleTaskSubmit}
            isEditing={!!editingTask}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;