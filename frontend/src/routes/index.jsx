import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, setInitialized } from '../redux/slices/authSlice';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Layout from '../components/layout/Layout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Services from '../pages/Services';
import Availability from '../pages/Availability';
import BookAppointment from '../pages/BookAppointment';
import MyAppointments from '../pages/MyAppointments';
import Reports from '../pages/Reports';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AppRoutes = () => {
  const dispatch = useDispatch();
  const { user, loading, initialized, token } = useSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !user && !initialized) {
        console.log('Initializing auth with token...');
        try {
          await dispatch(getMe()).unwrap();
        } catch (error) {
          console.log('Auth initialization failed:', error);
        } finally {
          dispatch(setInitialized());
        }
      } else if (!token) {
        dispatch(setInitialized());
      }
    };
    
    initializeAuth();
  }, [dispatch, token, user, initialized]);

  if (!initialized && token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
        <p className="ml-3 text-gray-600">Loading your session...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/*--------------- Public routes ---------------------*/}
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to="/" />} 
      />
      <Route 
        path="/register" 
        element={!user ? <Register /> : <Navigate to="/" />} 
      />
      
      {/*--------------- Protected routes ---------------------------*/}
      <Route 
        path="/" 
        element={user ? <Layout /> : <Navigate to="/login" />}
      >
        <Route index element={<Dashboard />} />
        <Route 
          path="services" 
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <Services />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="availability" 
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <Availability />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="book" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <BookAppointment />
            </ProtectedRoute>
          } 
        />
        <Route path="appointments" element={<MyAppointments />} />
        <Route 
          path="reports" 
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <Reports />
            </ProtectedRoute>
          } 
        />
      </Route>
      
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
    </Routes>
  );
};

export default AppRoutes;