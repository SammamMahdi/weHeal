import { User } from '../models/userModel.js';

// Ensure that the `getUsers` function is correctly implemented
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, data: { user } });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { name, email, phone, isVerified, role, patientDetails, doctorDetails, clinicStaffDetails, adminDetails } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (role !== undefined) user.role = role;
    if (patientDetails !== undefined) user.patientDetails = { ...user.patientDetails, ...patientDetails };
    if (doctorDetails !== undefined) user.doctorDetails = { ...user.doctorDetails, ...doctorDetails };
    if (clinicStaffDetails !== undefined) user.clinicStaffDetails = { ...user.clinicStaffDetails, ...clinicStaffDetails };
    if (adminDetails !== undefined) user.adminDetails = { ...user.adminDetails, ...adminDetails };
    await user.save();
    return res.json({ success: true, data: { user } });
  } catch (error) {
    console.error('Error updating user by ID:', error);
    return res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Prevent deleting the last admin
    if (user.role === 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user'
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    return res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error deleting user', 
      error: error.message 
    });
  }
};
