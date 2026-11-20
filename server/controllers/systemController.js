const { getStatus } = require('../config/db');
const simulator = require('../services/simulatorService');

// GET /api/health
const getHealth = (req, res) => {
  const dbStatus = getStatus();
  const simStatus = simulator.getStatus();

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    simulator: simStatus,
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage()
    }
  });
};

module.exports = {
  getHealth
};
