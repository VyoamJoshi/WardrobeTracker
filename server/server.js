import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import clothingRoutes from './routes/clothingRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { CATEGORIES, DEFAULT_THRESHOLDS } from './utils/statusCalculator.js';
import { isUsingInMemory } from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local dev
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: isUsingInMemory() ? 'PostgreSQL (pg-mem in-memory engine)' : 'PostgreSQL (Live Server)',
  });
});

// App Metadata (Categories & Default thresholds)
app.get('/api/metadata', (req, res) => {
  res.status(200).json({
    success: true,
    categories: CATEGORIES,
    defaultThresholds: DEFAULT_THRESHOLDS,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clothes', clothingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'The requested API endpoint was not found.',
  });
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'The uploaded image exceeds the 10MB size limit. Please upload a smaller file.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Image upload error: ${err.message}`,
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong on the server. Please try again.',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Personal Wardrobe Tracker Server running on port ${PORT}`);
  console.log(`🌐 Base API available at: http://localhost:${PORT}/api`);
});

export default app;
