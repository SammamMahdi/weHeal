import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoute.js";
import dashboardRoutes from "./routes/dashboardRoute.js";
import adminRoutes from './routes/adminRoutes.js';
import videoCallRoutes from './routes/videoCallRoutes.js';

const app = express();

// Global request logger
app.use((req, res, next) => {
  console.log('=== Incoming Request ===');
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  next();
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/video-call', videoCallRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  console.log('Route not found:', req.method, req.originalUrl);
  res.status(404).send('Route not found');
});

export default app;