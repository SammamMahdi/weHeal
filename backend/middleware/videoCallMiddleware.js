import { Appointment } from '../models/appointmentModel.js';

export const checkVideoCallAvailability = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is authorized
    if (userId.toString() !== appointment.doctorId.toString() && 
        userId.toString() !== appointment.patientId.toString()) {
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

    // Check if it's time for the appointment
    const now = new Date();
    const appointmentTime = new Date(appointment.appointmentDate);
    appointmentTime.setHours(
      parseInt(appointment.startTime.split(':')[0]),
      parseInt(appointment.startTime.split(':')[1])
    );
    const endTime = new Date(appointmentTime.getTime() + 50 * 60000);

    if (now < appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Appointment has not started yet'
      });
    }

    if (now > endTime) {
      return res.status(400).json({
        success: false,
        message: 'Appointment time has ended'
      });
    }

    // Add appointment to request for use in controllers
    req.appointment = appointment;
    next();
  } catch (error) {
    console.error('Error in checkVideoCallAvailability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking video call availability',
      error: error.message
    });
  }
}; 