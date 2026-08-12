import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

export const ProtectedRoute: React.FC = () => {
  const isAuth = isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};
