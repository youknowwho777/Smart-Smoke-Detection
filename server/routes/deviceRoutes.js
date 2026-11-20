const express = require('express');
const router = express.Router();
const { getDevices, getDeviceById, registerDevice } = require('../controllers/deviceController');

router.get('/', getDevices);
router.get('/:deviceId', getDeviceById);
router.post('/register', registerDevice);

module.exports = router;
