import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter object using Gmail's SMTP transport
export const transporter = nodemailer.createTransport({
  secure: true, // Use SSL
  host: "smtp.gmail.com", // Use 'gmail' for Gmail's SMTP service
  port: 465, // Port for SSL
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail password or app-specific password
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email service:", error);
  } else {
    console.log("Email service is ready to send messages");
  }
});

export const sender = {
  email: process.env.EMAIL_USER,
  name: "Your App Name",
};
