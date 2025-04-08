import React from "react";
import { useNavigate } from "react-router-dom"; // Importing useNavigate for redirection
import AuthForm from "../components/AuthForm";
import { signupUser } from "../utils/api";

const Signup = () => {
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleSignup = async (data) => {
    try {
      const response = await signupUser(
        data.name,
        data.email,
        data.password,
        data.phone,
        data.role
      );

      // Successful signup
      alert("Signup successful! Please verify your email.");

      // Redirect to Verify Email page after successful signup
      navigate("/verify-email"); // Redirects to the verify email page
    } catch (error) {
      alert("Error during signup. Please try again.");
    }
  };
  

  return (
    <div>
      <h2>Sign Up</h2>
      <AuthForm type="signup" onSubmit={handleSignup} />
      {/* Button to redirect to login page */}
    </div>
  );
};

export default Signup;
