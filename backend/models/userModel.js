// models/User.js
import mongoose from "mongoose";
import { MEDICAL_SPECIALIZATIONS } from '../constants/specializations.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    lastLogin: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    verificationToken: { type: String },
    verificationExpires: { type: Date },
    role: {
      type: String,
      enum: ["Patient", "Doctor", "ClinicStaff", "Admin", "Nurse"],
      required: true,
      default: "Patient",
    },
    password: { type: String, required: true },
    patientDetails: {
      DOB: Date,
      address: String,
      insuranceDetails: mongoose.Schema.Types.Mixed,
    },
    doctorDetails: {
      specialization: {
        type: String,
        enum: MEDICAL_SPECIALIZATIONS,
        required: function() { return this.role === 'Doctor'; }
      },
      yearsOfExperience: {
        type: Number,
        min: 0,
        max: 50,
        required: function() { return this.role === 'Doctor'; }
      },
      education: [{
        degree: String,
        institution: String,
        year: Number
      }],
      availabilitySchedule: [String],
      consultationFee: {
        type: Number,
        min: 0,
        required: function() { return this.role === 'Doctor'; }
      },
      bio: {
        type: String,
        maxLength: 500
      },
      languages: [{
        type: String,
        enum: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Hindi', 'Arabic', 'Russian', 'Japanese', 'Korean','Bangla']
      }]
    },
    clinicStaffDetails: {
      clinicLocation: String,
    },
    adminDetails: {
      // No specific fields needed as _id will be used
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);