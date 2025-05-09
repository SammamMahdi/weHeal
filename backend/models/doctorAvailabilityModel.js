import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  appointment: {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    type: {
      type: String,
      enum: ['in-person', 'tele-consult'],
      // required: true
    },
    notes: String
  }
});

const doctorAvailabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: function(v) {
        return v.equals(this.userId);
      },
      message: 'doctorId must match userId'
    }
  },
  dayOfWeek: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  timeSlots: [timeSlotSchema],
  isWorkingDay: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create compound indexes for both field names
doctorAvailabilitySchema.index({ userId: 1, dayOfWeek: 1 }, { unique: true });
doctorAvailabilitySchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });

// Add pre-save middleware to ensure doctorId matches userId
doctorAvailabilitySchema.pre('save', function(next) {
  if (!this.doctorId) {
    this.doctorId = this.userId;
  }
  next();
});

// Add a method to check if a time slot is available
doctorAvailabilitySchema.methods.isSlotAvailable = function(startTime, endTime) {
  return this.timeSlots.some(slot => 
    slot.startTime === startTime && 
    slot.endTime === endTime && 
    slot.isAvailable && 
    !slot.appointment
  );
};

// Add a method to book a time slot
doctorAvailabilitySchema.methods.bookSlot = async function(startTime, endTime, appointmentData) {
  const slot = this.timeSlots.find(slot => 
    slot.startTime === startTime && 
    slot.endTime === endTime
  );

  if (!slot || !slot.isAvailable || slot.appointment) {
    throw new Error('Time slot is not available');
  }

  slot.appointment = appointmentData;
  slot.isAvailable = false;
  await this.save();
  return slot;
};

export const DoctorAvailability = mongoose.model('DoctorAvailability', doctorAvailabilitySchema); 