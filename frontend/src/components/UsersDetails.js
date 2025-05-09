import React from 'react';

const UserDetails = ({ user }) => {
  return (
    <div className="user-details">
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Status:</strong> {user.isVerified ? 'Active' : 'Inactive'}</p>
      <p><strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleString()}</p>
    </div>
  );
};

export default UserDetails;
