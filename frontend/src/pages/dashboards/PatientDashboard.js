import React, { useEffect, useState } from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { initFeatherIcons, getPatientDashboard, logoutUser, api } from '../../utils/api';
import DoctorSearch from '../../components/DoctorSearch';
import '../../styles/PatientDashboard.css';

const PatientDashboard = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDoctorSearch, setShowDoctorSearch] = useState(false);
  const [cancellingAppointment, setCancellingAppointment] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!appointmentId) {
      alert('Invalid appointment');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setCancellingAppointment(true);
      const response = await api.post(`/patient/cancel-appointment/${appointmentId}`);
      
      if (response.data.success) {
        // Remove the cancelled appointment from the state
        setDashboardData(prev => ({
          ...prev,
          patientData: {
            ...prev.patientData,
            upcomingAppointments: prev.patientData.upcomingAppointments.filter(
              apt => apt._id !== appointmentId
            )
          }
        }));
        alert('Appointment cancelled successfully');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error cancelling appointment';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setCancellingAppointment(false);
    }
  };

  const handleStartVideoCall = (appointmentId) => {
    navigate(`/video-call/${appointmentId}`);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getPatientDashboard();
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
    return <div>Please log in to view your dashboard.</div>;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.user) {
    return <div className="error-message">No dashboard data available</div>;
  }

  return (
    <div className="patient-dashboard">
      {showDoctorSearch ? (
        <DoctorSearch 
          onBack={() => setShowDoctorSearch(false)} 
          onAppointmentBooked={(newDashboardData) => {
            setDashboardData(newDashboardData);
            setShowDoctorSearch(false);
          }}
        />
      ) : (
        <>
          <div className="dashboard-header">
            <div className="header-left">
              <h1>Welcome back, {user.name}</h1>
              <p>Here's an overview of your health journey</p>
            </div>
            <div className="header-right">
              <div className="profile-section">
                <img src="https://i.pravatar.cc/40" alt="Profile" />
                <div className="profile-info">
                  <span>{user.name}</span>
                  <small>Patient</small>
                </div>
                <button className="btn btn-secondary" onClick={handleLogout}>
                  <i data-feather="log-out"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Visits</h3>
              <div className="stat-number">{dashboardData.patientData.totalVisits}</div>
              <div className="stat-trend trend-up">
                <i data-feather="trending-up"></i>
                <span>+2 this month</span>
              </div>
            </div>
            <div className="stat-card">
              <h3>Outstanding Bills</h3>
              <div className="stat-number">${dashboardData.patientData.outstandingBills}</div>
              <div className="stat-trend trend-down">
                <i data-feather="trending-down"></i>
                <span>-$50 from last month</span>
              </div>
            </div>
            <div className="stat-card">
              <h3>Loyalty Points</h3>
              <div className="stat-number">{dashboardData.patientData.loyaltyPoints}</div>
              <div className="stat-trend trend-up">
                <i data-feather="award"></i>
                <span>Silver Member</span>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <div className="action-card" onClick={() => setShowDoctorSearch(true)}>
              <i data-feather="search"></i>
              <h4>Find Doctor</h4>
            </div>
            <div className="action-card">
              <i data-feather="file-text"></i>
              <h4>Medical Records</h4>
            </div>
            <div className="action-card">
              <i data-feather="credit-card"></i>
              <h4>Payments</h4>
            </div>
          </div>

          <div className="appointments-section">
            <div className="section-header">
              <h2>Upcoming Appointments</h2>
            </div>
            <div className="appointments-grid">
              {dashboardData.patientData.upcomingAppointments && 
               dashboardData.patientData.upcomingAppointments.length > 0 ? (
                dashboardData.patientData.upcomingAppointments.map((appointment, index) => {
                  console.log('Rendering appointment:', appointment);
                  return (
                    <div key={appointment._id || index} className="appointment-card">
                      <div className="doctor-info">
                        <img src={`https://i.pravatar.cc/150?img=${index + 1}`} alt={appointment.doctor} />
                        <div>
                          <h4>{appointment.doctor}</h4>
                          <span className="specialization">{appointment.specialization}</span>
                        </div>
                      </div>
                      <div className="appointment-details">
                        <span>
                          <i data-feather="calendar"></i>
                          {new Date(appointment.date).toLocaleDateString()}
                        </span>
                        <span>
                          <i data-feather="clock"></i>
                          {appointment.time}
                        </span>
                        <span>
                          <i data-feather="activity"></i>
                          {appointment.type === 'tele-consult' ? 'Tele-consultation' : 'In-person Visit'}
                        </span>
                        <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="appointment-actions">
                        {appointment.type === 'tele-consult' && 
                         appointment.status === 'scheduled' && 
                         new Date(appointment.date) <= new Date() && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleStartVideoCall(appointment._id)}
                            disabled={appointment.videoCallStatus === 'completed'}
                          >
                            <i data-feather="video"></i>
                            {appointment.videoCallStatus === 'in-progress' ? 'Join Call' : 
                             appointment.videoCallStatus === 'completed' ? 'Call Completed' : 
                             'Start Call'}
                          </button>
                        )}
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleCancelAppointment(appointment._id)}
                          disabled={cancellingAppointment || !appointment._id || appointment.status === 'completed'}
                        >
                          <i data-feather="x"></i>
                          {cancellingAppointment ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-appointments">
                  <i data-feather="calendar"></i>
                  <p>No upcoming appointments</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientDashboard; 