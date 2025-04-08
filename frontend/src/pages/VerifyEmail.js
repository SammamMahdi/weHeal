// src/pages/VerifyEmail.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for redirection
import { verifyEmail } from '../utils/api'; // Assuming verifyEmail API method is implemented

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
    <div className="verify-email-container">
      <h2>Verify Your Email</h2>
      <form onSubmit={handleSubmit} className="verify-email-form">
        <input
          type="text"
          name="code"
          placeholder="Enter verification code"
          value={code}
          onChange={handleCodeChange}
          required
        />
        <button type="submit" disabled={isLoading}>Verify Email</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default VerifyEmail;
