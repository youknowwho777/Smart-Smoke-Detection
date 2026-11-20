const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      default: 'SMOKE-001',
      unique: true,
      index: true
    },
    warningThreshold: {
      type: Number,
      default: 2000,
      min: 100,
      max: 4000
    },
    criticalThreshold: {
      type: Number,
      default: 3000,
      min: 200,
      max: 4095
    },
    simulationInterval: {
      type: Number,
      default: 3000,
      min: 500,
      max: 60000
    },
    simulationEnabled: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Settings', settingsSchema);
