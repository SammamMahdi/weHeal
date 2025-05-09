// src/pages/VerifyEmail.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Importing useNavigate for redirection and Link for navigation
import { verifyEmail } from '../utils/api'; // Assuming verifyEmail API method is implemented
import '../styles/Auth.css';

const VerifyEmail = () => {
  const navigate = useNavigate();  // Hook for programmatic navigation
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code) {
      setMessage('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyEmail(code);
      if (response.success) {
        setMessage('Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login'); // Redirect to the login page after email is verified
        }, 2000); // Wait for 2 seconds before redirecting
      } else {
        setMessage(response.message || 'Invalid or expired verification code');
      }
    } catch (error) {
      setMessage('Error verifying email. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Verify Your Email</h2>
        <p className="auth-description">
          Please enter the verification code sent to your email address.
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              name="code"
              placeholder="Enter verification code"
              value={code}
              onChange={handleCodeChange}
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
          <span> | </span>
          <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
