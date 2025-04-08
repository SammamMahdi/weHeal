// src/pages/Dashboard.js
import React from 'react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h2>Welcome to Your Dashboard</h2>
        <p>This is a demo dashboard page. You can add more content here.</p>
      </div>
    </div>
  );
};

export default Dashboard;
