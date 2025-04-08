// models/User.js
import mongoose from "mongoose";

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
      enum: ["Patient", "Doctor", "ClinicStaff", "Admin"],
      required: true,
      default: "Patient",
    },
    password: { type: String, required: true },
    patientDetails: {
      patientID: String,
      DOB: Date,
      address: String,
      insuranceDetails: mongoose.Schema.Types.Mixed,
    },
    doctorDetails: {
      doctorID: String,
      specialization: String,
      availabilitySchedule: [String],
    },
    clinicStaffDetails: {
      staffID: String,
      clinicLocation: String,
    },
    adminDetails: {
      adminID: String,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);


