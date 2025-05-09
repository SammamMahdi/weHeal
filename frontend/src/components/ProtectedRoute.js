import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { checkAuth } from '../utils/api';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // First check if we have a token
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          console.log('No token found, not authenticated');
          return;
        }

        const response = await checkAuth();
        console.log('Auth check response:', response);
        if (response.success) {
          setUser(response.user);
          setIsAuthenticated(true);
          console.log('Authenticated user:', response.user);
          // Check if trying to access admin route without admin role
          if (location.pathname.includes('/dashboard/admin') && response.user.role !== 'Admin') {
            console.log('Non-admin user trying to access admin route');
            setIsAuthenticated(false);
          }
        } else {
          // If verification fails, clear the stored data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          console.log('Auth verification failed');
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [location.pathname]);

  if (isLoading) {
    console.log('ProtectedRoute: loading...');
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: authenticated, rendering children');
  return <Outlet context={{ user }} />;
};

export default ProtectedRoute;
