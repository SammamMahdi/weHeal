// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom"; // useNavigate for redirecting to login after logout

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Perform logout logic (e.g., clearing the token and redirecting to the login page)
    // Example: clear token and redirect to login page
    localStorage.removeItem("token"); // If you're storing the token in localStorage
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h2 className="navbar-brand">WeHeal</h2>
        <ul className="navbar-links">
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
