import { Center, Loader } from '@mantine/core';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useSelector(
    (state: RootState) => state.auth,
  );
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  // If not authenticated, redirect to login with return url
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return <>{children}</>;
}

export default ProtectedRoute;
