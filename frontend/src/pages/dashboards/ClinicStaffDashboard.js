import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { initFeatherIcons, getDashboard, logoutUser } from '../../utils/api';
import '../../styles/Dashboard.css';

const ClinicStaffDashboard = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

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

    initFeatherIcons();
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="staff">
      <div className="header">
        <div className="search">
          <input type="text" placeholder="Search appointments, patients..." />
        </div>
        <div className="profile">
          <img src="https://i.pravatar.cc/36" alt="avatar" />
          <span>{user.name}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            <i data-feather="log-out"></i>
            Logout
          </button>
        </div>
      </div>

      <h1>Welcome, {user.name}</h1>

      <div className="widgets-row">
        <div className="widget">
          <h3>Today's Overview</h3>
          <p>Total Appointments: <strong>{dashboardData?.staffData?.totalAppointments || 0}</strong></p>
          <p>Pending Tasks: <strong>{dashboardData?.staffData?.pendingTasks || 0}</strong></p>
          <p>Inventory Alerts: <strong>{dashboardData?.staffData?.inventoryAlerts || 0}</strong></p>
        </div>

        <div className="widget">
          <h3>Today's Schedule</h3>
          <ul>
            {dashboardData?.staffData?.todaySchedule?.map((schedule, index) => (
              <li key={index}>
                <span>
                  {schedule.time} - {schedule.patient} with {schedule.doctor}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="actions-row">
        <button className="btn btn-primary">
          <i data-feather="user-plus"></i>
          Check-In Patient
        </button>
        <button className="btn btn-primary">
          <i data-feather="calendar"></i>
          Schedule Appointment
        </button>
        <button className="btn btn-primary">
          <i data-feather="dollar-sign"></i>
          Process Payment
        </button>
        <button className="btn btn-primary">
          <i data-feather="file-text"></i>
          View Reports
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <input type="text" placeholder="Search appointments..." />
          <div className="actions">
            <button title="Download CSV">
              <i data-feather="download"></i>
            </button>
            <button title="Refresh">
              <i data-feather="refresh-ccw"></i>
            </button>
          </div>
        </div>
        <table className="app-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Room</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>09:00 AM</td>
              <td>John Smith</td>
              <td>Dr. Wilson</td>
              <td>Room 101</td>
              <td><span className="status-scheduled">Checked In</span></td>
              <td>
                <button className="btn btn-primary">Update</button>
                <button className="btn btn-secondary">View</button>
              </td>
            </tr>
            <tr>
              <td>09:30 AM</td>
              <td>Sarah Johnson</td>
              <td>Dr. Lee</td>
              <td>Room 102</td>
              <td><span className="status-pending">Waiting</span></td>
              <td>
                <button className="btn btn-primary">Check In</button>
                <button className="btn btn-secondary">View</button>
              </td>
            </tr>
            <tr>
              <td>10:00 AM</td>
              <td>Mike Davis</td>
              <td>Dr. Smith</td>
              <td>Room 103</td>
              <td><span className="status-cancelled">Cancelled</span></td>
              <td>
                <button className="btn btn-primary">Reschedule</button>
                <button className="btn btn-secondary">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClinicStaffDashboard; 