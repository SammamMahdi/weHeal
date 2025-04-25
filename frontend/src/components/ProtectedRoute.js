import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/auth/check-auth', { withCredentials: true })
      .then(response => {
        if (response.data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(error => {
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show a loading state until we know if the user is authenticated
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />; // Redirect to login if not authenticated
};

export default ProtectedRoute;
