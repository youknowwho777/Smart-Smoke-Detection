const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    deviceName: {
      type: String,
      default: 'Smoke Detector Unit 1',
      trim: true
    },
    sensorType: {
      type: String,
      default: 'MQ-2',
      trim: true
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'warning', 'critical'],
      default: 'online'
    },
    mode: {
      type: String,
      enum: ['simulation', 'hardware'],
      default: 'simulation'
    },
    location: {
      type: String,
      default: 'Main Enclosure / Lab A'
    },
    ipAddress: {
      type: String,
      default: '192.168.1.105'
    },
    lastSeen: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Device', deviceSchema);
