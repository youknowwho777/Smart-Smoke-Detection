const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    rawAdc: {
      type: Number,
      required: true,
      min: 0,
      max: 4095
    },
    voltage: {
      type: Number,
      required: true,
      min: 0,
      max: 3.3
    },
    status: {
      type: String,
      enum: ['SAFE', 'WARNING', 'CRITICAL'],
      default: 'SAFE'
    },
    fanStatus: {
      type: Boolean,
      default: false
    },
    buzzerStatus: {
      type: Boolean,
      default: false
    },
    ledStatus: {
      type: Boolean,
      default: false
    },
    isSimulated: {
      type: Boolean,
      default: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

sensorReadingSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorReading', sensorReadingSchema);
