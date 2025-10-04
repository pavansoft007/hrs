import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import './App.css';
import { DashboardLayout } from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import BlankPage from './pages/BlankPage';
import CreateHotel from './pages/CreateHotel';
import CreateRestaurant from './pages/CreateRestaurant';
import SimpleDashboard from './pages/SimpleDashboard';
import { EditHotel } from './pages/hotels/EditHotel';
import { Hotels } from './pages/hotels/Hotels';
import { ViewHotel } from './pages/hotels/ViewHotel';
import Login from './pages/Login';
import Register from './pages/Register';
import { EditRestaurant } from './pages/restaurants/EditRestaurant';
import { Restaurants } from './pages/restaurants/Restaurants';
import { ViewRestaurant } from './pages/restaurants/ViewRestaurant';
import RolesPermissions from './pages/RolesPermissions';
import { CreateUser } from './pages/users/CreateUser';
import { EditUser } from './pages/users/EditUser';
import { Users } from './pages/users/Users';
import { ViewUser } from './pages/users/ViewUser';
import { store } from './store';
import './styles/layout.css';
import { initializeApp } from './utils/api';
import './utils/systemReset'; // Development utility

// Custom theme for responsive design
const theme = createTheme({
  breakpoints: {
    xs: '30em',
    sm: '48em',
    md: '64em',
    lg: '74em',
    xl: '90em',
  },
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  colors: {
    primary: [
      '#e3f2fd',
      '#bbdefb',
      '#90caf9',
      '#64b5f6',
      '#42a5f5',
      '#2196f3',
      '#1e88e5',
      '#1976d2',
      '#1565c0',
      '#0d47a1',
    ],
  },
  primaryColor: 'primary',
  defaultRadius: 'md',
});

function App() {
  // Initialize authentication on app start
  useEffect(() => {
    const initApp = async () => {
      try {
        await initializeApp();
      } catch (error) {
        console.error('App initialization failed:', error);
      }
    };
    initApp();
  }, []);

  return (
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <Router>
          <div
            style={{
              minHeight: '100vh',
              width: '100%',
              overflow: 'auto',
            }}
          >
            <Routes>
              {/* Default route redirects to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Dashboard route with full featured admin dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <SimpleDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties"
                element={
                  <ProtectedRoute>
                    <BlankPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <BlankPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guests"
                element={
                  <ProtectedRoute>
                    <BlankPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <ProtectedRoute>
                    <BlankPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <BlankPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <BlankPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <BlankPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/master-admin"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <BlankPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-hotel"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CreateHotel />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-restaurant"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CreateRestaurant />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hotels"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Hotels />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hotels/view/:id"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ViewHotel />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hotels/edit/:id"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <EditHotel />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurants"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Restaurants />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurants/:id"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ViewRestaurant />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurants/:id/edit"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <EditRestaurant />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Users />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/create"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CreateUser />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/view/:id"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ViewUser />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/edit/:id"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <EditUser />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roles-permissions"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <RolesPermissions />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/property-admin"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <BlankPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              {/* Catch all route redirects to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </MantineProvider>
    </Provider>
  );
}

export default App;
