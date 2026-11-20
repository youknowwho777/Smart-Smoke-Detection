const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      required: true,
      index: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    sensorValue: {
      type: Number,
      required: true
    },
    acknowledged: {
      type: Boolean,
      default: false,
      index: true
    },
    acknowledgedAt: {
      type: Date
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

alertSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('Alert', alertSchema);
