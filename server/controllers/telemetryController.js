const telemetryService = require('../services/telemetryService');
const dataStore = require('../utils/dataStore');

// POST /api/telemetry
const receiveTelemetry = async (req, res, next) => {
  try {
    const payload = req.body;

    // Validate payload
    if (!payload) {
      return res.status(400).json({
        success: false,
        message: 'Telemetry payload is empty'
      });
    }

    const reading = await telemetryService.processTelemetry(payload);

    res.status(201).json({
      success: true,
      message: 'Telemetry processed successfully',
      data: reading
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/telemetry/latest
const getLatestTelemetry = async (req, res, next) => {
  try {
    const { deviceId } = req.query;
    const latest = await dataStore.getLatestReading(deviceId || process.env.DEFAULT_DEVICE_ID || 'SMOKE-001');

    if (!latest) {
      return res.status(200).json({
        success: true,
        message: 'No telemetry readings available yet',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: latest
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/telemetry/history
const getTelemetryHistory = async (req, res, next) => {
  try {
    const { deviceId, limit = 50, hours = 1 } = req.query;
    const targetDevice = deviceId || process.env.DEFAULT_DEVICE_ID || 'SMOKE-001';

    const readings = await dataStore.getReadingHistory({
      deviceId: targetDevice,
      limit: parseInt(limit, 10) || 50,
      hours: parseFloat(hours) || 1
    });

    res.status(200).json({
      success: true,
      count: readings.length,
      data: readings
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/telemetry/:deviceId
const getTelemetryByDeviceId = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const { limit = 50 } = req.query;

    const readings = await dataStore.getReadingHistory({
      deviceId,
      limit: parseInt(limit, 10) || 50
    });

    res.status(200).json({
      success: true,
      deviceId,
      count: readings.length,
      data: readings
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  receiveTelemetry,
  getLatestTelemetry,
  getTelemetryHistory,
  getTelemetryByDeviceId
};
