import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { initFeatherIcons, getDoctorDashboard, logoutUser } from '../../utils/api';
import DoctorAvailability from '../../components/DoctorAvailability';
import DoctorProfile from '../../components/DoctorProfile';
import '../../styles/Dashboard.css';

const DoctorDashboard = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAvailability, setShowAvailability] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

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
        setLoading(true);
        const response = await getDoctorDashboard();
        if (response.success) {
          setDashboardData(response.data);
          setError(null);
        } else {
          setError(response.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError(err.response?.data?.message || 'Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    initFeatherIcons();
  }, [dashboardData]);

  if (!user) {
    return (
      <div className="auth-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="auth-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.user) {
    return <div className="error">No dashboard data available</div>;
  }

  return (
    <div className="doctor">
      <div className="header">
        <div className="search">
          <input type="text" placeholder="Search patients, records..." />
        </div>
        <div className="profile">
          <img src="https://i.pravatar.cc/36" alt="avatar" />
          <span>Dr. {user.name}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            <i data-feather="log-out"></i>
            Logout
          </button>
        </div>
      </div>

      <h1>Welcome, Dr. {user.name}</h1>

      <div className="actions-top">
        <button className="btn btn-primary">
          <i data-feather="video"></i>
          Start Consultation
        </button>
        <button className="btn btn-secondary">
          <i data-feather="calendar"></i>
          View Schedule
        </button>
        <button 
          className={`btn ${showAvailability ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setShowAvailability(!showAvailability);
            setShowProfile(false);
          }}
        >
          <i data-feather="clock"></i>
          {showAvailability ? 'Hide Availability' : 'Manage Availability'}
        </button>
        <button 
          className={`btn ${showProfile ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setShowProfile(!showProfile);
            setShowAvailability(false);
          }}
        >
          <i data-feather="user"></i>
          {showProfile ? 'Hide Profile' : 'Edit Profile'}
        </button>
      </div>

      {showAvailability ? (
        <DoctorAvailability />
      ) : showProfile ? (
        <DoctorProfile />
      ) : (
        <>
          <section className="schedule-section">
            <h2>Today's Schedule</h2>
            <div className="timeline">
              {dashboardData?.doctorData?.schedule?.map((appointment) => (
                <div className="timeline-item" key={appointment._id}>
                  <span className="time">{appointment.time}</span>
                  <div className="details">
                    <span className="patient-name">{appointment.patient}</span>
                    <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <span className="mode">{appointment.type}</span>
                  <div className="appointment-actions">
                    {appointment.type === 'Tele-Consult' && (
                      <button className="btn btn-primary">
                        <i data-feather="video"></i>
                        Start Call
                      </button>
                    )}
                    <button className="btn btn-secondary">
                      <i data-feather="file-text"></i>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
              {(!dashboardData?.doctorData?.schedule || dashboardData.doctorData.schedule.length === 0) && (
                <div className="no-appointments">
                  <i data-feather="calendar"></i>
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </section>

          <div className="summary-row">
            <div className="summary-card">
              <h3>Patient Statistics</h3>
              <p>Total Patients: <strong>{dashboardData?.doctorData?.totalPatients || 0}</strong></p>
              <p>Appointments Today: <strong>{dashboardData?.doctorData?.appointmentsToday || 0}</strong></p>
              <p>Upcoming Appointments: <strong>{dashboardData?.doctorData?.upcomingAppointments || 0}</strong></p>
              <p>Completed Appointments: <strong>{dashboardData?.doctorData?.completedAppointments || 0}</strong></p>
            </div>
          </div>

          <div className="summary-row">
            <div className="summary-card card-queue">
              <h3>Patient Queue</h3>
              <div className="value">{dashboardData?.doctorData?.patientQueue?.waiting || 0}</div>
              <div className="sub">Patients Waiting</div>
            </div>
            <div className="summary-card card-prescribe">
              <h3>Prescriptions</h3>
              <div className="value">{dashboardData?.doctorData?.prescriptionsToday?.completed || 0}</div>
              <div className="sub">Today's Total</div>
            </div>
            <div className="summary-card card-messages">
              <h3>Messages</h3>
              <div className="value">{dashboardData?.doctorData?.messages?.unread || 0}</div>
              <div className="sub">Unread</div>
            </div>
          </div>

          <div className="content-split">
            <div className="table-container">
              <div className="table-header">
                <h3>All Appointments</h3>
                <div className="search-actions">
                  <input type="text" placeholder="Search appointments..." />
                  <div className="actions">
                    <button title="Download CSV">
                      <i data-feather="download"></i>
                    </button>
                    <button title="Refresh" onClick={() => window.location.reload()}>
                      <i data-feather="refresh-ccw"></i>
                    </button>
                  </div>
                </div>
              </div>
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.doctorData?.allAppointments?.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>
                      <td>{appointment.patient}</td>
                      <td>{appointment.type}</td>
                      <td>
                        <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td>
                        {appointment.type === 'Tele-Consult' && (
                          <button className="btn btn-primary">
                            <i data-feather="video"></i>
                            Start Call
                          </button>
                        )}
                        <button className="btn btn-secondary">
                          <i data-feather="file-text"></i>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!dashboardData?.doctorData?.allAppointments || dashboardData.doctorData.allAppointments.length === 0) && (
                    <tr>
                      <td colSpan="6" className="no-data">
                        No appointments scheduled
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="alerts-panel">
              <h3>Critical Actions</h3>
              <div className="critical-actions">
                <button className="btn-critical">
                  <i data-feather="alert-circle"></i>
                  Review Lab Results ({dashboardData?.doctorData?.criticalActions?.labResults || 0})
                </button>
                <button className="btn-critical">
                  <i data-feather="file-text"></i>
                  Pending Reports ({dashboardData?.doctorData?.criticalActions?.pendingReports || 0})
                </button>
                <button className="btn-critical">
                  <i data-feather="message-square"></i>
                  Urgent Messages ({dashboardData?.doctorData?.criticalActions?.urgentMessages || 0})
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorDashboard; 