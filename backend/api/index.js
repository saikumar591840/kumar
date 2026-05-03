require('dotenv').config({ override: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('../routes/authRoutes');
const projectRoutes = require('../routes/projectRoutes');
const taskRoutes = require('../routes/taskRoutes');
const { errorHandler } = require('../middleware/errorMiddleware');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.vercel.app', 'http://localhost:3000']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// MongoDB connection with caching for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  try {
    console.log('Connecting to MongoDB...');
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Increased to 10 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority',
      maxIdleTimeMS: 30000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });

    cachedDb = connection;
    console.log('✅ MongoDB Connected Successfully');
    return cachedDb;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Connection string used:', process.env.MONGO_URI ? 'Present' : 'Missing');
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database middleware error:', error.message);
    res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'Database connection failed. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/tasks', taskRoutes);

// Global Error Handler
app.use(errorHandler);

// Export for Vercel
module.exports = app;