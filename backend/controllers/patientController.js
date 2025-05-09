import { User } from '../models/userModel.js';
import { DoctorAvailability } from '../models/doctorAvailabilityModel.js';
import { Appointment } from '../models/appointmentModel.js';

export const getPatientDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Verify user is a patient
    if (user.role !== 'Patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Patient privileges required.'
      });
    }

    // Set to midnight UTC for today
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      patientId: user._id,
      appointmentDate: { $gte: today },
      status: { $ne: 'cancelled' }
    })
    .populate('doctorId', 'name doctorDetails')
    .sort({ appointmentDate: 1 });

    // Get total visits (completed appointments)
    const totalVisits = await Appointment.countDocuments({
      patientId: user._id,
      status: 'completed'
    });

    // Format appointments for the frontend
    const formattedAppointments = upcomingAppointments.map(apt => ({
      _id: apt._id,
      doctor: `Dr. ${apt.doctorId.name}`,
      date: apt.appointmentDate,
      time: `${apt.startTime} - ${apt.endTime}`,
      type: apt.type,
      status: apt.status,
      specialization: apt.doctorId.doctorDetails?.specialization || '',
      videoCallStatus: apt.videoCallStatus,
      videoCallStartTime: apt.videoCallStartTime,
      videoCallEndTime: apt.videoCallEndTime
    }));

    // Get patient dashboard data
    const dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      patientData: {
        totalVisits,
        outstandingBills: 150.00, // This would come from your billing collection
        loyaltyPoints: 100, // This would come from your loyalty points system
        upcomingAppointments: formattedAppointments,
        notifications: [
          'Your next appointment is tomorrow',
          'New lab results available',
          'Prescription renewal due in 5 days'
        ]
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error in getPatientDashboard:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching patient dashboard data',
      error: error.message 
    });
  }
};

export const searchDoctors = async (req, res) => {
  try {
    const { name, specialization } = req.query;
    let query = { role: 'Doctor', isVerified: true };

    // Add name search if provided (case-insensitive)
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    // Add specialization filter if provided
    if (specialization) {
      query['doctorDetails.specialization'] = specialization;
    }

    const doctors = await User.find(query)
      .select('name doctorDetails')
      .sort('name')
      .lean();

    // Format the response data
    const formattedDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      name: doctor.name,
      doctorDetails: {
        specialization: doctor.doctorDetails?.specialization || '',
        yearsOfExperience: doctor.doctorDetails?.yearsOfExperience || 0,
        consultationFee: doctor.doctorDetails?.consultationFee || 0,
        languages: doctor.doctorDetails?.languages || [],
        bio: doctor.doctorDetails?.bio || ''
      }
    }));

    res.json({
      success: true,
      data: formattedDoctors
    });
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching doctors',
      error: error.message
    });
  }
};

// Get a specific doctor's availability for a date
export const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Validate doctor exists and is verified
    const doctor = await User.findOne({
      _id: doctorId,
      role: 'Doctor',
      isVerified: true
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or not verified'
      });
    }

    // Get doctor's availability for the day of week
    const availability = await DoctorAvailability.findOne({ 
      userId: doctorId,
      dayOfWeek 
    });

    if (!availability || !availability.isWorkingDay) {
      return res.status(404).json({
        success: false,
        message: 'Doctor is not available on this day'
      });
    }

    // Get existing appointments for the date
    const existingAppointments = await Appointment.find({
      doctorId,
      appointmentDate: selectedDate,
      status: { $ne: 'cancelled' }
    });

    // Filter out booked slots
    const availableSlots = availability.timeSlots
      .filter(slot => slot.isAvailable)
      .filter(slot => !existingAppointments.some(appointment => 
        appointment.startTime === slot.startTime && 
        appointment.endTime === slot.endTime
      ))
      .map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime
      }));

    res.json({
      success: true,
      data: {
        doctor: {
          name: doctor.name,
          specialization: doctor.doctorDetails.specialization,
          consultationFee: doctor.doctorDetails.consultationFee
        },
        date: selectedDate.toISOString(),
        dayOfWeek,
        availableSlots
      }
    });
  } catch (error) {
    console.error('Error in getDoctorAvailability:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor availability',
      error: error.message
    });
  }
};

// Book an appointment
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, type } = req.body;
    const patientId = req.user._id;

    // Validate required fields
    if (!doctorId || !date || !startTime || !endTime || !type) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if slot is available
    const isAvailable = await Appointment.isSlotAvailable(doctorId, date, startTime, endTime);
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Selected time slot is not available'
      });
    }

    // Get doctor's consultation fee
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      doctorId,
      patientId,
      appointmentDate: date,
      startTime,
      endTime,
      type,
      consultationFee: doctor.doctorDetails.consultationFee
    });

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error in bookAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error booking appointment',
      error: error.message
    });
  }
};

// Cancel an appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const patientId = req.user._id;

    // Find and delete the appointment if it belongs to the patient
    const deletedAppointment = await Appointment.findOneAndDelete({
      _id: appointmentId,
      patientId,
      // Only allow cancelling future appointments
      appointmentDate: { $gt: new Date() }
    });

    if (!deletedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or cannot be cancelled'
      });
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: deletedAppointment
    });
  } catch (error) {
    console.error('Error in cancelAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
}; 