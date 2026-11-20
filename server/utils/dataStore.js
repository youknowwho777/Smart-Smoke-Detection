const mongoose = require('mongoose');
const Device = require('../models/Device');
const SensorReading = require('../models/SensorReading');
const Alert = require('../models/Alert');
const Settings = require('../models/Settings');
const { memoryStore, isFallbackActive } = require('../config/db');

const isMongooseReady = () => mongoose.connection.readyState === 1 && !isFallbackActive();

// --- Devices ---
const getDevices = async () => {
  if (isMongooseReady()) {
    return await Device.find().sort({ lastSeen: -1 }).lean();
  }
  return Array.from(memoryStore.devices.values());
};

const getDeviceById = async (deviceId) => {
  if (isMongooseReady()) {
    return await Device.findOne({ deviceId }).lean();
  }
  return memoryStore.devices.get(deviceId) || null;
};

const upsertDevice = async (deviceId, data) => {
  if (isMongooseReady()) {
    return await Device.findOneAndUpdate(
      { deviceId },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  const existing = memoryStore.devices.get(deviceId) || {
    deviceId,
    deviceName: 'Smoke Detector Unit 1',
    sensorType: 'MQ-2',
    status: 'online',
    mode: 'simulation',
    location: 'Main Enclosure / Lab A',
    ipAddress: '192.168.1.105',
    createdAt: new Date()
  };
  const updated = { ...existing, ...data, deviceId, lastSeen: data.lastSeen || new Date() };
  memoryStore.devices.set(deviceId, updated);
  return updated;
};

// --- Telemetry / Sensor Readings ---
const saveReading = async (readingData) => {
  if (isMongooseReady()) {
    const reading = new SensorReading(readingData);
    return await reading.save();
  }
  const reading = {
    _id: 'read_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    ...readingData,
    timestamp: readingData.timestamp || new Date()
  };
  memoryStore.readings.push(reading);
  // Cap in-memory history to last 1000 items to prevent memory bloat
  if (memoryStore.readings.length > 1000) {
    memoryStore.readings.shift();
  }
  return reading;
};

const getLatestReading = async (deviceId) => {
  if (isMongooseReady()) {
    const query = deviceId ? { deviceId } : {};
    return await SensorReading.findOne(query).sort({ timestamp: -1 }).lean();
  }
  const readings = deviceId
    ? memoryStore.readings.filter(r => r.deviceId === deviceId)
    : memoryStore.readings;
  return readings.length > 0 ? readings[readings.length - 1] : null;
};

const getReadingHistory = async ({ deviceId, limit = 50, hours = 1 }) => {
  if (isMongooseReady()) {
    const query = {};
    if (deviceId) query.deviceId = deviceId;
    if (hours) {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      query.timestamp = { $gte: since };
    }
    const readings = await SensorReading.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .lean();
    return readings.reverse();
  }
  let filtered = deviceId
    ? memoryStore.readings.filter(r => r.deviceId === deviceId)
    : [...memoryStore.readings];
    
  if (hours) {
    const since = Date.now() - hours * 60 * 60 * 1000;
    filtered = filtered.filter(r => new Date(r.timestamp).getTime() >= since);
  }
  
  const sliced = filtered.slice(-Number(limit));
  return sliced;
};

// --- Alerts ---
const saveAlert = async (alertData) => {
  if (isMongooseReady()) {
    const alert = new Alert(alertData);
    return await alert.save();
  }
  const alert = {
    _id: 'alt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    ...alertData,
    acknowledged: false,
    timestamp: alertData.timestamp || new Date()
  };
  memoryStore.alerts.unshift(alert);
  if (memoryStore.alerts.length > 500) {
    memoryStore.alerts.pop();
  }
  return alert;
};

const getAlerts = async ({ deviceId, severity, acknowledged, limit = 50 }) => {
  if (isMongooseReady()) {
    const query = {};
    if (deviceId) query.deviceId = deviceId;
    if (severity) query.severity = severity;
    if (acknowledged !== undefined) query.acknowledged = acknowledged === 'true' || acknowledged === true;
    return await Alert.find(query).sort({ timestamp: -1 }).limit(Number(limit)).lean();
  }
  let results = [...memoryStore.alerts];
  if (deviceId) results = results.filter(a => a.deviceId === deviceId);
  if (severity) results = results.filter(a => a.severity === severity);
  if (acknowledged !== undefined) {
    const isAck = acknowledged === 'true' || acknowledged === true;
    results = results.filter(a => a.acknowledged === isAck);
  }
  return results.slice(0, Number(limit));
};

const getAlertById = async (id) => {
  if (isMongooseReady()) {
    return await Alert.findById(id).lean();
  }
  return memoryStore.alerts.find(a => a._id === id || a.id === id) || null;
};

const acknowledgeAlert = async (id) => {
  if (isMongooseReady()) {
    return await Alert.findByIdAndUpdate(
      id,
      { $set: { acknowledged: true, acknowledgedAt: new Date() } },
      { new: true }
    );
  }
  const alert = memoryStore.alerts.find(a => a._id === id || a.id === id);
  if (alert) {
    alert.acknowledged = true;
    alert.acknowledgedAt = new Date();
    return alert;
  }
  return null;
};

// --- Settings ---
const getSettings = async (deviceId = 'SMOKE-001') => {
  if (isMongooseReady()) {
    let settings = await Settings.findOne({ deviceId }).lean();
    if (!settings) {
      settings = await Settings.create({
        deviceId,
        warningThreshold: 2000,
        criticalThreshold: 3000,
        simulationInterval: 3000,
        simulationEnabled: true
      });
    }
    return settings;
  }
  if (!memoryStore.settings.has(deviceId)) {
    memoryStore.settings.set(deviceId, {
      deviceId,
      warningThreshold: 2000,
      criticalThreshold: 3000,
      simulationInterval: 3000,
      simulationEnabled: true,
      updatedAt: new Date()
    });
  }
  return memoryStore.settings.get(deviceId);
};

const updateSettings = async (deviceId = 'SMOKE-001', updateData) => {
  if (isMongooseReady()) {
    return await Settings.findOneAndUpdate(
      { deviceId },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  const current = await getSettings(deviceId);
  const updated = { ...current, ...updateData, deviceId, updatedAt: new Date() };
  memoryStore.settings.set(deviceId, updated);
  return updated;
};

module.exports = {
  getDevices,
  getDeviceById,
  upsertDevice,
  saveReading,
  getLatestReading,
  getReadingHistory,
  saveAlert,
  getAlerts,
  getAlertById,
  acknowledgeAlert,
  getSettings,
  updateSettings
};
