require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const instancesRoutes = require('./routes/instances');
const materialsRoutes = require('./routes/materials');
const classesRoutes = require('./routes/classes');
const schedulesRoutes = require('./routes/schedules');
const pollsRoutes = require('./routes/polls');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/instances', instancesRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/polls', pollsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 DevFlix API running on http://localhost:${PORT}/api`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
