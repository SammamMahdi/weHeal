import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { getUsers, getUserById, updateUserById, deleteUserById } from "../controllers/adminController.js";

const router = express.Router();

// Protect all admin routes with authentication and admin middleware
router.use(protect);
router.use(isAdmin);

// Ensure the route is correct
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUserById);
router.delete("/users/:id", deleteUserById);

export default router;
