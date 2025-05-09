import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

// Protect routes middleware
export const protect = async (req, res, next) => {
  try {
    let token;
    console.log('protect middleware: incoming request', req.method, req.originalUrl);

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('protect middleware: found Bearer token');
    } else if (req.cookies.token) {
      token = req.cookies.token;
      console.log('protect middleware: found cookie token');
    }

    if (!token) {
      console.log('protect middleware: no token found');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('protect middleware: token decoded', decoded);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        console.log('protect middleware: user not found');
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = user;
      console.log('protect middleware: user authenticated', user._id);

      // Update last login
      await User.findByIdAndUpdate(decoded.userId, {
        lastLogin: new Date()
      });

      next();
    } catch (error) {
      console.log('protect middleware: token failed', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    console.log('protect middleware: server error', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Admin middleware
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as an admin'
    });
  }
}; 