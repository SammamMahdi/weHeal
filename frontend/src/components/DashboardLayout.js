import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { initFeatherIcons, logoutUser } from '../utils/api';
import '../styles/Dashboard.css';

const DashboardLayout = ({ user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const navigate = useNavigate();

  useEffect(() => {
    initFeatherIcons();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getLinks = (role) => {
    const links = [
      { to: '/dashboard', icon: 'home', text: 'Dashboard', roles: ['patient', 'doctor', 'clinic', 'admin'] },
    ];

    if (role === 'patient') {
      links.push(
        { to: '/dashboard/appointments', icon: 'calendar', text: 'Appointments' },
        { to: '/dashboard/prescriptions', icon: 'file-text', text: 'Prescriptions' },
        { to: '/dashboard/medical-records', icon: 'folder', text: 'Medical Records' }
      );
    } else if (role === 'doctor') {
      links.push(
        { to: '/dashboard/schedule', icon: 'clock', text: 'Schedule' },
        { to: '/dashboard/patients', icon: 'users', text: 'Patients' },
        { to: '/dashboard/consultations', icon: 'message-square', text: 'Consultations' }
      );
    } else if (role === 'clinic') {
      links.push(
        { to: '/dashboard/appointments', icon: 'calendar', text: 'Appointments' },
        { to: '/dashboard/doctors', icon: 'user-plus', text: 'Doctors' },
        { to: '/dashboard/patients', icon: 'users', text: 'Patients' }
      );
    } else if (role === 'admin') {
      links.push(
        { to: '/dashboard/users', icon: 'users', text: 'Users' },
        { to: '/dashboard/clinics', icon: 'home', text: 'Clinics' },
        { to: '/dashboard/settings', icon: 'settings', text: 'Settings' }
      );
    }

    return links;
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Toggle Button */}
      <button 
        className="sidebar-toggle d-md-none"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <i data-feather={isSidebarOpen ? 'x' : 'menu'} />
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logo.png" alt="WeHeal" className="logo" />
          <button 
            className="toggle-btn d-none d-md-block"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <i data-feather={isSidebarOpen ? 'chevron-left' : 'chevron-right'} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {getLinks(user.role).map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/dashboard'}>
              <i data-feather={link.icon} />
              <span>{link.text}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <header className="main-header">
          <h2 className="user-welcome">Welcome, {user.name}</h2>
          <button className="logout-btn" onClick={handleLogout}>
            <i data-feather="log-out" />
            <span>Logout</span>
          </button>
        </header>
        <div className="content">
          <Outlet context={user} />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout; 