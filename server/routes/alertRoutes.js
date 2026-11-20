const express = require('express');
const router = express.Router();
const { getAlerts, getAlertById, acknowledgeAlert } = require('../controllers/alertController');

router.get('/', getAlerts);
router.get('/:id', getAlertById);
router.patch('/:id/acknowledge', acknowledgeAlert);

module.exports = router;
