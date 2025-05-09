import { User } from "../models/userModel.js";
import { DoctorAvailability } from "../models/doctorAvailabilityModel.js";
import { Appointment } from "../models/appointmentModel.js";

// Generate time slots from 8 AM to 12 AM with 1-hour duration and 10-minute gaps
const generateTimeSlots = () => {
  const slots = [];
  const startHour = 8; // 8 AM
  const endHour = 24; // 12 AM

  for (let hour = startHour; hour < endHour; hour++) {
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    const endTime = `${hour.toString().padStart(2, "0")}:50`; // 50 minutes duration, 10 minutes gap
    slots.push({
      startTime,
      endTime,
      isAvailable: false,
    });
  }
  return slots;
};

// Initialize doctor's availability for all days
const initializeDoctorAvailability = async (userId) => {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const defaultSlots = generateTimeSlots();

  try {
    // Check for existing records first
    const existingRecords = await DoctorAvailability.find({ 
      $or: [
        { userId },
        { doctorId: userId }
      ]
    });
    console.log("Existing availability records:", existingRecords);

    // If there are existing records, update them to use both fields
    if (existingRecords.length > 0) {
      await Promise.all(existingRecords.map(async (record) => {
        if (!record.doctorId) {
          record.doctorId = record.userId;
        } else if (!record.userId) {
          record.userId = record.doctorId;
        }
        await record.save();
      }));
    }

    // Create availability entries for each day
    await Promise.all(
      daysOfWeek.map(async (day) => {
        console.log(`Creating availability for ${day} with userId:`, userId);
        return DoctorAvailability.create({
          userId,
          doctorId: userId, // Explicitly set both fields
          dayOfWeek: day,
          timeSlots: defaultSlots,
          isWorkingDay: day !== "Saturday" && day !== "Sunday", // Default weekends as non-working
        });
      })
    );
  } catch (error) {
    console.error("Error initializing doctor availability:", error);
    throw error;
  }
};

export const getDoctorDashboard = async (req, res) => {
  try {
    // Get doctor's profile
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    } 

    // Verify user is a doctor
    if (user.role !== "Doctor") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Doctor privileges required.",
      });
    }

    console.log("Fetching availability for userId:", req.user._id);
    // Get doctor's availability
    let availability = await DoctorAvailability.find({ userId: req.user._id });
    console.log("Current availability:", availability);
    
    // If no availability exists, initialize it
    if (!availability || availability.length === 0) {
      console.log("No availability found, initializing...");
      await initializeDoctorAvailability(req.user._id);
      availability = await DoctorAvailability.find({ userId: req.user._id });
      console.log("Availability after initialization:", availability);
    }

    // Get today's date at midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Get tomorrow's date at midnight UTC
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    // Get today's appointments
    const todaysAppointments = await Appointment.find({
      doctorId: req.user._id,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow,
      },
      status: { $ne: "cancelled" },
    })
      .populate("patientId", "name")
      .sort({ startTime: 1 });
    console.log("todaysAppointments", todaysAppointments);
    // Get upcoming appointments (beyond today)
    const upcomingAppointments = await Appointment.find({
      doctorId: req.user._id,
      appointmentDate: { $gt: tomorrow },
      status: { $ne: "cancelled" },
    })
      .populate("patientId", "name")
      .sort({ appointmentDate: 1, startTime: 1 });
    console.log("upcomingAppointments", upcomingAppointments);
    // Get all scheduled appointments beyond today
    const allScheduledAppointments = await Appointment.find({
      doctorId: req.user._id,
      appointmentDate: { $gte: today },
      status: { $ne: "cancelled" },
    })
      .populate("patientId", "name")
      .sort({ appointmentDate: 1, startTime: 1 });
    console.log("allScheduledAppointments", allScheduledAppointments);
    // Format appointments for the frontend
    const formattedTodayAppointments = todaysAppointments.map((apt) => ({
      _id: apt._id,
      time: `${apt.startTime} - ${apt.endTime}`,
      patient: apt.patientId.name,
      type: apt.type === "in-person" ? "In-Person" : "Tele-Consult",
      status: apt.status
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }));
    console.log("formattedTodayAppointments", formattedTodayAppointments);
    // Format all appointments for the frontend
    const formattedAllAppointments = allScheduledAppointments.map((apt) => ({
      _id: apt._id,
      date: new Date(apt.appointmentDate).toLocaleDateString(),
      time: `${apt.startTime} - ${apt.endTime}`,
      patient: apt.patientId.name,
      type: apt.type === "in-person" ? "In-Person" : "Tele-Consult",
      status: apt.status
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }));
    console.log("formattedAllAppointments", formattedAllAppointments);
    // Get total patients (unique patients who have appointments)
    const totalPatients = await Appointment.distinct("patientId", {
      doctorId: req.user._id,
      status: { $ne: "cancelled" },
    }).count();
    console.log("totalPatients", totalPatients);
    // Get completed appointments count
    const completedAppointments = await Appointment.countDocuments({
      doctorId: req.user._id,
      status: "completed",
    });
    console.log("completedAppointments", completedAppointments);
    // Get waiting patients count
    const waitingPatients = await Appointment.countDocuments({
      doctorId: req.user._id,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow,
      },
      status: "scheduled",
    });
    console.log("waitingPatients", waitingPatients);
    // Get doctor dashboard data
    const dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      doctorData: {
        totalPatients,
        appointmentsToday: todaysAppointments.length,
        upcomingAppointments: upcomingAppointments.length,
        completedAppointments,
        schedule: formattedTodayAppointments,
        allAppointments: formattedAllAppointments,
        patientQueue: {
          waiting: todaysAppointments.filter(
            (apt) => apt.status.toLowerCase() === "scheduled"
          ).length,
        },
        prescriptionsToday: {
          completed: 3, // Placeholder
        },
        messages: {
          unread: 2, // Placeholder
        },
        criticalActions: {
          labResults: 1, // Placeholder
          pendingReports: 2, // Placeholder
          urgentMessages: 1, // Placeholder
        },
      },
    };
    console.log("dashboardData", dashboardData);
    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error in getDoctorDashboard:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching doctor dashboard data",
      error: error.message,
    });
  }
};

// Get doctor's availability for a specific day
export const getDoctorAvailability = async (req, res) => {
  try {
    const { dayOfWeek } = req.params;

    // Validate day of week
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    if (!validDays.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: "Invalid day of week",
      });
    }

    let availability = await DoctorAvailability.findOne({
      userId: req.user._id,
      dayOfWeek,
    });

    // If no availability exists, initialize all days and fetch the requested day
    if (!availability) {
      await initializeDoctorAvailability(req.user._id);
      availability = await DoctorAvailability.findOne({
        userId: req.user._id,
        dayOfWeek,
      });
    }

    res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Error in getDoctorAvailability:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching doctor availability",
      error: error.message,
    });
  }
};

// Update doctor's availability for a specific day
export const updateDoctorAvailability = async (req, res) => {
  try {
    const { dayOfWeek } = req.params;
    const { timeSlots, isWorkingDay } = req.body;

    // Validate day of week
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    if (!validDays.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: "Invalid day of week",
      });
    }

    // Validate time slots format if provided
    if (timeSlots) {
      for (const slot of timeSlots) {
        if (!slot.startTime || !slot.endTime) {
          return res.status(400).json({
            success: false,
            message: "Invalid time slot format",
          });
        }
      }
    }

    const availability = await DoctorAvailability.findOneAndUpdate(
      {
        userId: req.user._id,
        dayOfWeek,
      },
      {
        $set: {
          timeSlots: timeSlots || generateTimeSlots(),
          isWorkingDay: isWorkingDay !== undefined ? isWorkingDay : true,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Error in updateDoctorAvailability:", error);
    res.status(500).json({
      success: false,
      message: "Error updating doctor availability",
      error: error.message,
    });
  }
};

// Get all doctor's availability
export const getAllDoctorAvailability = async (req, res) => {
  try {
    let availability = await DoctorAvailability.find({ userId: req.user._id });

    // If no availability exists, initialize it
    if (!availability || availability.length === 0) {
      await initializeDoctorAvailability(req.user._id);
      availability = await DoctorAvailability.find({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Error in getAllDoctorAvailability:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching doctor availability",
      error: error.message,
    });
  }
};
