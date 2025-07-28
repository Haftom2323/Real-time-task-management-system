import React from 'react';
import { useSelector } from 'react-redux';
import AdminDashboard from '../features/admin/AdminDashboard';
import UserDashboard from '../features/user/UserDashboard';

const DashboardPage: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user);

  if (!user) return null;

  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
};

export default DashboardPage;