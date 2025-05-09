// src/pages/ForgotPassword.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../utils/api'; // Assuming forgotPassword API method is implemented
import '../styles/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await forgotPassword(email);
      if (response.success) {
        setMessage('Password reset link has been sent to your email.');
      } else {
        setMessage(response.message || 'Failed to send password reset email');
      }
    } catch (error) {
      setMessage('Error sending password reset email. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Reset Your Password</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
          <div className="auth-links">
            Remember your password? <Link to="/login">Login</Link>
          </div>
        </form>
        {message && (
          <p className={`message ${message.includes("sent") ? "success" : "error"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

