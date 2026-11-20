const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  triggerScenario,
  toggleSimulation
} = require('../controllers/settingsController');

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/simulation/scenario', triggerScenario);
router.post('/simulation/toggle', toggleSimulation);

module.exports = router;
