import express from "express";
import {
  signup,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
} from "../controllers/authController.js";
import { getDashboard } from "../controllers/dashboardController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.get("/check-auth", verifyToken, checkAuth);
router.get("/dashboard", verifyToken, getDashboard);

export default router;
