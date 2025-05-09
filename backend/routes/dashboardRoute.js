import express from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Get role-specific dashboard data
router.get("/", verifyToken, getDashboard);

export default router; 