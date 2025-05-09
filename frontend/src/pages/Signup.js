import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../utils/api";
import "../styles/Auth.css";
import { MEDICAL_SPECIALIZATIONS } from "../constants/specializations";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "Patient",
    doctorDetails: {
      specialization: "",
      yearsOfExperience: "",
      consultationFee: "",
      education: [{ degree: "", institution: "", year: "" }],
    },
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("doctorDetails.")) {
      const field = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        doctorDetails: {
          ...prevData.doctorDetails,
          [field]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await signupUser(
        formData.name,
        formData.email,
        formData.password,
        formData.phone,
        formData.role,
        formData.role === "Doctor" ? formData.doctorDetails : undefined
      );

      if (response.success) {
        setMessage("Signup successful! Please verify your email.");
        setTimeout(() => {
          navigate("/verify-email");
        }, 2000);
      } else {
        setMessage(
          response.message || "Error during signup. Please try again."
        );
      }
    } catch (error) {
      setMessage("Error during signup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Create Your Account</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="auth-form"
          >
            <option value="Patient">Patient</option>
            <option value="Doctor">Doctor</option>
            <option value="Admin">Admin</option>
            <option value="ClinicStaff">Clinic Staff</option>
            <option value="Nurse">Nurse</option>
          </select>

          {formData.role === "Doctor" && (
            <>
              <select
                name="doctorDetails.specialization"
                value={formData.doctorDetails.specialization}
                onChange={handleChange}
                required
                className="auth-form"
              >
                <option value="">Select Specialization</option>
                {MEDICAL_SPECIALIZATIONS.map((specialization) => (
                  <option value={specialization}>{specialization}</option>
                ))}
              </select>
              <input
                type="number"
                name="doctorDetails.yearsOfExperience"
                placeholder="Years of Experience"
                value={formData.doctorDetails.yearsOfExperience}
                onChange={handleChange}
                min="0"
                max="50"
                required
              />
              <input
                type="number"
                name="doctorDetails.consultationFee"
                placeholder="Consultation Fee"
                value={formData.doctorDetails.consultationFee}
                onChange={handleChange}
                min="0"
                required
              />
            </>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
          <div className="auth-links">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
        {message && (
          <p
            className={`message ${
              message.includes("success") ? "success" : "error"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Signup;
