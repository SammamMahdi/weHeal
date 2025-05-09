import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isDoctor } from '../middleware/roleMiddleware.js';
import { 
  getDoctorDashboard, 
  getDoctorAvailability,
  updateDoctorAvailability,
  getAllDoctorAvailability
} from '../controllers/doctorController.js';
import {
  getDoctorProfile,
  updateDoctorProfile,
  getSpecializations
} from '../controllers/doctorProfileController.js';

const router = express.Router();

// All routes are protected and require doctor role
router.use(protect);
router.use(isDoctor);

// Doctor dashboard route
router.get('/dashboard', getDoctorDashboard);

// Doctor availability routes
router.get('/availability', getAllDoctorAvailability);
router.get('/availability/:dayOfWeek', getDoctorAvailability);
router.put('/availability/:dayOfWeek', updateDoctorAvailability);

// Doctor profile routes
router.get('/profile', getDoctorProfile);
router.put('/profile', updateDoctorProfile);
router.get('/specializations', getSpecializations);

export default router; 