// src/pages/ResetPassword.js
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../utils/api'; // Assuming resetPassword API method is implemented
import '../styles/Auth.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams(); // Grab the token from the URL using useParams
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') setPassword(value);
    if (name === 'confirmPassword') setConfirmPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setMessage('Password should be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Send the reset token and the new password to the backend
      const response = await resetPassword(token, password); // Correct API call with token and new password
      if (response.success) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login'); // Redirect to login after successful reset
        }, 2000);
      } else {
        setMessage(response.message || 'Failed to reset password');
      }
    } catch (error) {
      setMessage('Error resetting password. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Set New Password</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="password"
            name="password"
            placeholder="New Password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={handlePasswordChange}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
          <div className="auth-links">
            Remember your password? <Link to="/login">Login</Link>
          </div>
        </form>
        {message && (
          <p className={`message ${message.includes("success") ? "success" : "error"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
