import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  if (!AuthService.isAuthenticated()) {
    // Redirect to login page with the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children as React.ReactElement;
};
