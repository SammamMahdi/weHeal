import { transporter, sender } from './mailConfig.js';
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from './emailTemplates.js';

// Utility function to send emails
const sendEmail = async ({ to, subject, html, category }) => {
  try {
    const mailOptions = {
      from: `${sender.name} <${sender.email}>`,
      to,
      subject,
      html,
      headers: {
        'X-Mailer': 'Nodemailer',
        'Category': category,
      },
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`${subject} email sent successfully: ${info.response}`);
  } catch (error) {
    console.error(`Error sending ${subject} email:`, error);
    throw new Error(`Error sending ${subject} email: ${error}`);
  }
};

// Email sending functions
export const sendVerificationEmail = async (email, verificationToken) => {
  const html = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken);
  await sendEmail({ to: email, subject: "Verify your email", html, category: "Email Verification" });
};

export const sendWelcomeEmail = async (email, name) => {
  const html = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", name); // Example, use proper template
  await sendEmail({ to: email, subject: "Welcome to WeHeal", html, category: "Welcome" });
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL);
  await sendEmail({ to: email, subject: "Reset your password", html, category: "Password Reset" });
};

export const sendResetSuccessEmail = async (email) => {
  await sendEmail({ to: email, subject: "Password Reset Successful", html: PASSWORD_RESET_SUCCESS_TEMPLATE, category: "Password Reset" });
};
