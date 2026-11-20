require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const simulator = require('./services/simulatorService');

// Route imports
const deviceRoutes = require('./routes/deviceRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const alertRoutes = require('./routes/alertRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const systemRoutes = require('./routes/systemRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/devices', deviceRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', systemRoutes);

// Root greeting & status
app.get('/', (req, res) => {
  res.json({
    name: 'IoT Smart Smoke Detection & Safety Monitoring API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: [
      '/api/devices',
      '/api/telemetry',
      '/api/alerts',
      '/api/settings',
      '/api/health'
    ]
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();

  // Initialize simulator if enabled
  if (process.env.SIMULATION_ENABLED !== 'false') {
    await simulator.start();
  }

  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🔥 Smoke Detection Backend Server running on port ${PORT}`);
    console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });

  return server;
};

// Start when not required by test runner
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
