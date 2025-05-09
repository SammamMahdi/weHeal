import React, { useState } from 'react';

const UserForm = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'Patient',
    isVerified: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      console.log('User added successfully');
      // Optionally, you can refresh the users list or redirect to another page
    } else {
      console.error('Error adding user');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={userData.name}
        onChange={handleChange}
        placeholder="Name"
        required
      />
      <input
        type="email"
        name="email"
        value={userData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <select name="role" value={userData.role} onChange={handleChange}>
        <option value="Patient">Patient</option>
        <option value="Doctor">Doctor</option>
        <option value="ClinicStaff">Clinic Staff</option>
      </select>
      <button type="submit">Add User</button>
    </form>
  );
};

export default UserForm;
