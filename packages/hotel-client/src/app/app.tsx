import { Route, Routes, Navigate } from 'react-router-dom';
import { Login } from '../components/Login';
import { Dashboard } from '../components/Dashboard';
import { RoomManagement } from '../components/RoomManagement';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AuthService } from '../services/auth';

export function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rooms"
        element={
          <ProtectedRoute>
            <RoomManagement />
          </ProtectedRoute>
        }
      />

      {/* Root Route - Redirect based on authentication */}
      <Route
        path="/"
        element={
          AuthService.isAuthenticated() ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch all - redirect to dashboard or login */}
      <Route
        path="*"
        element={
          AuthService.isAuthenticated() ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
