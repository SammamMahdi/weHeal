import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getPatientDashboard, 
  searchDoctors, 
  getDoctorAvailability,
  bookAppointment,
  cancelAppointment 
} from '../controllers/patientController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Patient dashboard route
router.get('/dashboard', getPatientDashboard);

// Search doctors route
router.get('/search-doctors', searchDoctors);

// Get specific doctor's availability
router.get('/doctor-availability/:doctorId', getDoctorAvailability);

// Book appointment
router.post('/book-appointment', bookAppointment);

// Cancel appointment
router.post('/cancel-appointment/:appointmentId', cancelAppointment);

export default router; 