import { User } from '../models/userModel.js';

export const isDoctor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'Doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor privileges required.'
      });
    }

    // Add user to request for use in controllers
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in isDoctor middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying doctor role',
      error: error.message
    });
  }
}; 