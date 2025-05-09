// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import ForgotPassword from "./pages/ForgotPassword"; // Import ForgotPassword component
import VerifyEmail from "./pages/VerifyEmail"; // Import VerifyEmail component
import Login from "./pages/Login"; // Login page component
import Signup from "./pages/Signup"; // Example other page // Example dashboard after login
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import PatientDashboard from "./pages/dashboards/PatientDashboard";
import DoctorDashboard from "./pages/dashboards/DoctorDashboard";
import ClinicStaffDashboard from "./pages/dashboards/ClinicStaffDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import AdminUserDetails from "./pages/dashboards/AdminUserDetails";


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Navigate to="/dashboard/patient" />} />
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
          <Route path="/dashboard/clinic-staff" element={<ClinicStaffDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/user/:id" element={<AdminUserDetails />} />
        </Route>

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;