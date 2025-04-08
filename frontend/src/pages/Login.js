// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { loginUser } from "../utils/api"; // Assuming loginUser API method is implemented

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // hook to handle navigation

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser(email, password);
      if (response.success) {
        setMessage("Login successful!");
        // Redirect to homepage or dashboard after successful login
        navigate("/dashboard"); // Redirects to /dashboard after successful login
      } else {
        setMessage(response.message || "Login failed");
      }
    } catch (error) {
      setMessage("Error logging in. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password button click (redirect to /forgot-password)
  const handleForgotPasswordClick = () => {
    navigate("/forgot-password"); // Redirect to the Forgot Password page
  };
  const handleSignupClick = () => {
    navigate("/"); // Redirect to the Signup page
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleEmailChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={handlePasswordChange}
          required
        />
        <button type="submit" disabled={isLoading}>
          Login
        </button>
        <button
          onClick={handleForgotPasswordClick}
          className="forgot-password-btn"
        >
          Forgot Password?
        </button>
        <button onClick={handleSignupClick} className="signup-btn">
          Sign Up
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Login;
