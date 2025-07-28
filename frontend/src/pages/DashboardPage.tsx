import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

const UserDashboard: React.FC = () => (
  <div>
    <h2>User Dashboard</h2>
    <p>You'll see your tasks here.</p>
  </div>
);

const AdminDashboard: React.FC = () => (
  <div>
    <h2>Admin Dashboard</h2>
    <p>You'll manage tasks and users here.</p>
  </div>
);

const DashboardPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    // Not logged in, redirect to login
    window.location.href = '/';
    return null;
  }

  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
};

export default DashboardPage;