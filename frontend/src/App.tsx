import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import LoginRegisterPage from './pages/LoginRegisterPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginRegisterPage />} />
      <Route path="/dashboard" element={<div>Dashboard (to be implemented)</div>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
