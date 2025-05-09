import express from 'express';
console.log('videoCallRoutes loaded');
import { protect } from '../middleware/authMiddleware.js';
import { 
  getVideoCallDetails, 
  updateVideoCallStatus, 
  endVideoCall 
} from '../controllers/videoCallController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get video call details
router.get('/:appointmentId', (req, res, next) => {
  console.log('getVideoCallDetails handler called');
  getVideoCallDetails(req, res, next);
});

// Update video call status
router.put('/:appointmentId/status', updateVideoCallStatus);

// End video call
router.post('/:appointmentId/end', endVideoCall);

export default router; 