import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginRegisterPage from './pages/LoginRegisterPage';
import DashboardPage from './pages/DashboardPage';

// Protected Route component
const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const user = useSelector((state: any) => state.auth.user);
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginRegisterPage />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/*" element={<DashboardPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
