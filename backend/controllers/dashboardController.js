import { User } from "../models/userModel.js";

export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Base dashboard data
    const dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    };

    // Add role-specific data
    switch (user.role) {
      case 'Patient':
        dashboardData.patientData = {
          totalVisits: 12, // You would fetch this from your database
          outstandingBills: 150.00,
          loyaltyPoints: 100,
          upcomingAppointments: [
            {
              doctor: 'Dr. Smith',
              date: '2024-03-20',
              time: '10:00 AM',
              type: 'Regular Checkup',
              status: 'Scheduled'
            }
          ],
          notifications: [
            'Your next appointment is tomorrow',
            'New lab results available',
            'Prescription renewal due in 5 days'
          ]
        };
        break;

      case 'Doctor':
        dashboardData.doctorData = {
          totalPatients: 150,
          appointmentsToday: 8,
          pendingPrescriptions: 3,
          schedule: [
            {
              time: '09:00 AM',
              patient: 'John Doe',
              type: 'Regular Checkup'
            }
          ]
        };
        break;

      case 'ClinicStaff':
        dashboardData.staffData = {
          totalAppointments: 25,
          pendingTasks: 5,
          inventoryAlerts: 2,
          todaySchedule: [
            {
              time: '09:00 AM',
              patient: 'John Doe',
              doctor: 'Dr. Smith'
            }
          ]
        };
        break;

      case 'Admin':
        dashboardData.adminData = {
          totalUsers: await User.countDocuments(),
          activeDoctors: await User.countDocuments({ role: 'Doctor' }),
          activePatients: await User.countDocuments({ role: 'Patient' }),
          pendingVerifications: await User.countDocuments({ isVerified: false })
        };
        break;

      default:
        return res.status(400).json({ 
          success: false, 
          message: "Invalid user role" 
        });
    }

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error in getDashboard:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard data',
      error: error.message 
    });
  }
}; 