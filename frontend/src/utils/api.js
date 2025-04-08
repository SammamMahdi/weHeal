import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to handle login
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to handle signup
export const signupUser = async (name, email, password, phone, role) => {
  try {
    const response = await api.post('/signup', { name, email, password, phone, role });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function for email verification
export const verifyEmail = async (code) => {
  try {
    const response = await api.post('/verify-email', { code });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await api.post(`/reset-password/${token}`, { password });  // Token in the URL and password in the body
    return response.data;
  } catch (error) {
    throw error;
  }
};
// Forgot Password API method
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Other API calls can be added similarly...
