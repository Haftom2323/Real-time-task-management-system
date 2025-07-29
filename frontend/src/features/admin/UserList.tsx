import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
  Button,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import axiosInstance from '../../api/axios';
import UserFormModal from './UserFormModal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const { data } = await axiosInstance.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setOpenForm(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    try {
      await axiosInstance.delete(`/users/${selectedUser._id}`);
      setUsers(users.filter(user => user._id !== selectedUser._id));
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setOpenDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  const handleFormSubmit = async (userData: any) => {
    try {
      if (editingUser) {
        const { data } = await axiosInstance.put(`/users/${editingUser._id}`, userData);
        setUsers(users.map(user => (user._id === editingUser._id ? data : user)));
      } else {
        const { data } = await axiosInstance.post('/users', userData);
        setUsers([...users, data]);
      }
      setOpenForm(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Add User
        </Button>
      </Box>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'admin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEdit(user)} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        onClick={() => handleDeleteClick(user)} 
                        color="error"
                        size="small"
                        disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <UserFormModal
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditingUser(null);
        }}
        onSubmit={handleFormSubmit}
        user={editingUser}
      />

      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        content={`Are you sure you want to delete ${selectedUser?.name}?`}
      />
    </Box>
  );
};

export default UserList;
