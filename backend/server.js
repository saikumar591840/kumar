require('dotenv').config({ override: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database connection with improved options
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  w: 'majority'
})
  .then(() => {
    console.log('MongoDB Connected');
    // Start server only after successful MongoDB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// For nested task routes, we can mount them either on /api/tasks or under projects.
// E.g., /api/projects/:projectId/tasks or /api/tasks
// The controller currently expects /api/projects/:projectId/tasks for get/create, 
// and /api/tasks/:id for update/delete. 
// Let's mount taskRoutes on both for simplicity, or re-structure.
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/tasks', taskRoutes);

const frontendDistPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.use((req, res) => {
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Team Task Manager API is running');
  });
}

// Global Error Handler
app.use(errorHandler);
