import { Appointment } from '../models/appointmentModel.js';
import { User } from '../models/userModel.js';

// Get video call details for an appointment
export const getVideoCallDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user._id;
    console.log('Looking for appointment:', appointmentId);

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email');
    console.log('Found appointment:', appointment);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is authorized
    if (userId.toString() !== appointment.doctorId._id.toString() && 
        userId.toString() !== appointment.patientId._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video call'
      });
    }

    // Check if it's a tele-consult
    if (appointment.type !== 'tele-consult') {
      return res.status(400).json({
        success: false,
        message: 'This appointment is not a tele-consultation'
      });
    }

    // Generate a unique room ID for the video call
    const roomId = `room_${appointmentId}`;

    // Determine participant name based on user role
    const participantName = userId.toString() === appointment.doctorId._id.toString()
      ? `Dr. ${appointment.doctorId.name}`
      : appointment.patientId.name;

    // Return the video call details
    res.json({
      success: true,
      data: {
        roomId,
        participantName,
        appointmentType: appointment.type,
        status: appointment.status,
        videoCallStatus: appointment.videoCallStatus,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        doctor: {
          name: appointment.doctorId.name,
          email: appointment.doctorId.email
        },
        patient: {
          name: appointment.patientId.name,
          email: appointment.patientId.email
        }
      }
    });
  } catch (error) {
    console.error('Error in getVideoCallDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting video call details',
      error: error.message
    });
  }
};

// Update video call status
export const updateVideoCallStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.videoCallStatus = status;
    if (status === 'in-progress') {
      appointment.videoCallStartTime = new Date();
    } else if (status === 'completed') {
      appointment.videoCallEndTime = new Date();
    }

    await appointment.save();

    res.json({
      success: true,
      message: 'Video call status updated successfully'
    });
  } catch (error) {
    console.error('Error updating video call status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video call status',
      error: error.message
    });
  }
};

// End video call
export const endVideoCall = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.videoCallStatus = 'completed';
    appointment.videoCallEndTime = new Date();
    await appointment.save();

    res.json({
      success: true,
      message: 'Video call ended successfully'
    });
  } catch (error) {
    console.error('Error ending video call:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending video call',
      error: error.message
    });
  }
}; 