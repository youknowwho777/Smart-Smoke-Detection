const express = require('express');
const router = express.Router();
const {
  receiveTelemetry,
  getLatestTelemetry,
  getTelemetryHistory,
  getTelemetryByDeviceId
} = require('../controllers/telemetryController');

router.post('/', receiveTelemetry);
router.get('/latest', getLatestTelemetry);
router.get('/history', getTelemetryHistory);
router.get('/:deviceId', getTelemetryByDeviceId);

module.exports = router;
