const dataStore = require('../utils/dataStore');

// GET /api/devices
const getDevices = async (req, res, next) => {
  try {
    const devices = await dataStore.getDevices();
    res.status(200).json({
      success: true,
      count: devices.length,
      data: devices
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/devices/:deviceId
const getDeviceById = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const device = await dataStore.getDeviceById(deviceId);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: `Device with ID ${deviceId} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: device
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/devices/register
const registerDevice = async (req, res, next) => {
  try {
    const { deviceId, deviceName, sensorType, mode, location, ipAddress } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'deviceId is required'
      });
    }

    const deviceData = {
      deviceName: deviceName || 'Smart Smoke Detector',
      sensorType: sensorType || 'MQ-2',
      mode: mode || 'hardware',
      location: location || 'Main Enclosure',
      ipAddress: ipAddress || '192.168.1.100',
      status: 'online',
      lastSeen: new Date()
    };

    const device = await dataStore.upsertDevice(deviceId, deviceData);

    res.status(201).json({
      success: true,
      message: `Device ${deviceId} registered successfully`,
      data: device
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDevices,
  getDeviceById,
  registerDevice
};
