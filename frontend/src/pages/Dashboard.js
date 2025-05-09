// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import Navbar from '../components/Navbar';
import { getDashboard } from '../utils/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboard();
        if (response.success) {
          setDashboardData(response.data);
        } else {
          setError(response.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        setError('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <div>Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h2>Welcome to Your Dashboard, {dashboardData?.user?.name}</h2>
        <div className="dashboard-content">
          <div className="dashboard-card">
            <h3>Your Profile</h3>
            <p>Email: {dashboardData?.user?.email}</p>
            <p>Role: {dashboardData?.user?.role}</p>
            <p>Email Verified: {dashboardData?.user?.isVerified ? 'Yes' : 'No'}</p>
          </div>
          {/* Add more dashboard cards/sections as needed */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
