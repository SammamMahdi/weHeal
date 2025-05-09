import { User } from '../models/userModel.js';
import { MEDICAL_SPECIALIZATIONS } from '../constants/specializations.js';

// Get doctor's profile
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id)
      .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken -verificationExpires');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Error in getDoctorProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor profile',
      error: error.message
    });
  }
};

// Update doctor's profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      specialization,
      yearsOfExperience,
      education,
      consultationFee,
      bio,
      languages
    } = req.body;

    // Validate specialization if provided
    if (specialization && !MEDICAL_SPECIALIZATIONS.includes(specialization)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid specialization'
      });
    }

    // Validate years of experience if provided
    if (yearsOfExperience !== undefined && (yearsOfExperience < 0 || yearsOfExperience > 50)) {
      return res.status(400).json({
        success: false,
        message: 'Years of experience must be between 0 and 50'
      });
    }

    // Validate consultation fee if provided
    if (consultationFee !== undefined && consultationFee < 0) {
      return res.status(400).json({
        success: false,
        message: 'Consultation fee cannot be negative'
      });
    }

    // Validate bio length if provided
    if (bio && bio.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Bio cannot exceed 500 characters'
      });
    }

    // Update doctor's profile
    const updatedDoctor = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name: name || req.user.name,
          phone: phone || req.user.phone,
          'doctorDetails.specialization': specialization || req.user.doctorDetails?.specialization,
          'doctorDetails.yearsOfExperience': yearsOfExperience || req.user.doctorDetails?.yearsOfExperience,
          'doctorDetails.consultationFee': consultationFee || req.user.doctorDetails?.consultationFee,
          'doctorDetails.bio': bio || req.user.doctorDetails?.bio,
          'doctorDetails.languages': languages || req.user.doctorDetails?.languages
        }
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password -resetPasswordToken -resetPasswordExpires -verificationToken -verificationExpires');

    // Update education if provided
    if (education && Array.isArray(education)) {
      updatedDoctor.doctorDetails.education = education;
      await updatedDoctor.save();
    }

    res.json({
      success: true,
      data: updatedDoctor
    });
  } catch (error) {
    console.error('Error in updateDoctorProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating doctor profile',
      error: error.message
    });
  }
};

// Get available specializations
export const getSpecializations = async (req, res) => {
  try {
    res.json({
      success: true,
      data: MEDICAL_SPECIALIZATIONS
    });
  } catch (error) {
    console.error('Error in getSpecializations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching specializations',
      error: error.message
    });
  }
}; 