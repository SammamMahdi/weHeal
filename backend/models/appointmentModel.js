import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true,
    set: function(val) {
      // Ensure the date is set to midnight UTC for consistent comparison
      const d = new Date(val);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    }
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['in-person', 'tele-consult'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: String,
  consultationFee: {
    type: Number,
    required: true
  },
  // Add video call related fields
  videoCallStatus: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  videoCallStartTime: Date,
  videoCallEndTime: Date
}, {
  timestamps: true
});

// Remove old indexes
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });

// Add new compound unique index for doctor's appointments
appointmentSchema.index(
  { 
    doctorId: 1, 
    appointmentDate: 1, 
    startTime: 1 
  }, 
  { 
    unique: true,
    partialFilterExpression: { status: { $ne: 'cancelled' } }
  }
);

// Add a method to check if a time slot is available
appointmentSchema.statics.isSlotAvailable = async function(doctorId, date, startTime, endTime) {
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  const selectedDate = new Date(date);
  selectedDate.setUTCHours(0, 0, 0, 0);  // Set to midnight UTC

  // Check if there's an existing appointment in this slot for the specific date
  const existingAppointment = await this.findOne({
    doctorId,
    appointmentDate: selectedDate,
    startTime,
    status: { $ne: 'cancelled' }
  });

  if (existingAppointment) {
    console.log('Slot is already booked for this date:', date);
    return false;
  }

  // Check if the doctor has this slot available in their weekly schedule
  const doctorAvailability = await mongoose.model('DoctorAvailability').findOne({
    userId: doctorId,
    dayOfWeek
  });

  if (!doctorAvailability || !doctorAvailability.isWorkingDay) {
    console.log('Doctor is not available on this day:', dayOfWeek);
    return false;
  }

  const isSlotInSchedule = doctorAvailability.timeSlots.some(slot => 
    slot.startTime === startTime && 
    slot.endTime === endTime && 
    slot.isAvailable
  );

  if (!isSlotInSchedule) {
    console.log('Slot is not in doctor\'s schedule');
    return false;
  }

  return true;
};

export const Appointment = mongoose.model('Appointment', appointmentSchema); 