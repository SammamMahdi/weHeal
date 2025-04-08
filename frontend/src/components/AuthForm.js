import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirecting to the Forgot Password page

const AuthForm = ({ type, onSubmit }) => {
  const navigate = useNavigate(); // Hook for programmatic navigation
  const handleLoginClick = () => {
    navigate("/login"); // Redirect to the Forgot Password page
  };
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "Patient",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {type === "signup" && (
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />
      )}
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />
      {type === "signup" && (
        <>
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="Patient">Patient</option>
            <option value="Doctor">Doctor</option>
            <option value="Admin">Admin</option>
          </select>
        </>
      )}
      <button type="submit">{type === "signup" ? "Sign Up" : "Login"}</button>
      <p>
        Already have an account?{" "}
      </p>
      <button onClick={handleLoginClick}>Login</button>
    </form>
  );
};

export default AuthForm;
