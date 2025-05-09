import React, { useEffect, useState } from 'react';
import { useUsersContext } from '../../contexts/UsersContext';
import UserDetails from '../../components/UsersDetails';
import UserForm from '../../components/UserForm';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import '../../styles/Auth.css';
import '../../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useOutletContext();
  const { users, dispatch } = useUsersContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  // Calculate user counts by role
  const userCounts = users?.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        if (response.data.success) {
          dispatch({ type: 'SET_USERS', payload: response.data.data.users });
        } else {
          setError(response.data.message || 'Failed to fetch users');
        }
      } catch (err) {
        setError('Error fetching users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [dispatch]);

  // Filter users based on search term, role, and status
  useEffect(() => {
    if (users) {
      const filtered = users.filter(user => {
        const matchesSearch =
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        const matchesStatus =
          statusFilter === 'All' ||
          (statusFilter === 'Verified' && user.isVerified) ||
          (statusFilter === 'Unverified' && !user.isVerified);
        return matchesSearch && matchesRole && matchesStatus;
      });
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users, roleFilter, statusFilter]);

  const handleLogout = () => {
    if (typeof logout === 'function') {
      logout();
    } else {
      navigate('/login');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setDeletingId(userId);
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        // Update the users list by removing the deleted user
        dispatch({ type: 'DELETE_USER', payload: userId });
        // Show success message
        setError(null);
      } else {
        setError(response.data.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('Error deleting user');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="auth-container" style={{ padding: '2rem', position: 'relative', minHeight: '100vh' }}>
      <div className="auth-form-container" style={{ maxWidth: '1200px', width: '100%' }}>
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
          <button className="btn btn-primary" onClick={handleLogout} style={{ minWidth: 100 }}>Logout</button>
        </div>
        {error && (
          <div className="message error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        {/* User Statistics Cards - compact row */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="stat-card" style={{ padding: '1rem' }}>
            <h3>Total Users</h3>
            <p className="stat-number">{users?.length || 0}</p>
          </div>
          <div className="stat-card" style={{ padding: '1rem' }}>
            <h3>Doctors</h3>
            <p className="stat-number">{userCounts?.Doctor || 0}</p>
          </div>
          <div className="stat-card" style={{ padding: '1rem' }}>
            <h3>Nurses</h3>
            <p className="stat-number">{userCounts?.Nurse || 0}</p>
          </div>
          <div className="stat-card" style={{ padding: '1rem' }}>
            <h3>Patients</h3>
            <p className="stat-number">{userCounts?.Patient || 0}</p>
          </div>
          <div className="stat-card" style={{ padding: '1rem' }}>
            <h3>Clinic Staff</h3>
            <p className="stat-number">{userCounts?.ClinicStaff || 0}</p>
          </div>
        </div>
        {/* Users Section */}
        <div className="users-section">
          <div className="section-header">
            <h3>Users</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="auth-form input"
                style={{ minWidth: 180 }}
              />
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="auth-form input" style={{ minWidth: 120 }}>
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Patient">Patient</option>
                <option value="ClinicStaff">ClinicStaff</option>
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="auth-form input" style={{ minWidth: 120 }}>
                <option value="All">All Status</option>
                <option value="Verified">Verified</option>
                <option value="Unverified">Unverified</option>
              </select>
            </div>
          </div>
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.charAt(0)}
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isVerified ? 'verified' : 'unverified'}`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn view"
                        style={{ marginBottom: '0.25rem', background: '#e0e7ff', color: '#3730a3' }}
                        onClick={() => navigate(`/dashboard/admin/user/${user._id}`)}
                      >
                        View Details
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={deletingId === user._id}
                      >
                        {deletingId === user._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
