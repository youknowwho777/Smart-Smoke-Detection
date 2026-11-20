const dataStore = require('../utils/dataStore');
const simulator = require('../services/simulatorService');

// GET /api/settings
const getSettings = async (req, res, next) => {
  try {
    const { deviceId = 'SMOKE-001' } = req.query;
    const settings = await dataStore.getSettings(deviceId);
    const simStatus = simulator.getStatus();

    res.status(200).json({
      success: true,
      data: {
        ...settings,
        simulatorStatus: simStatus
      }
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings
const updateSettings = async (req, res, next) => {
  try {
    const {
      deviceId = 'SMOKE-001',
      warningThreshold,
      criticalThreshold,
      simulationInterval,
      simulationEnabled
    } = req.body;

    const updatePayload = {};

    if (warningThreshold !== undefined) {
      const val = Number(warningThreshold);
      if (isNaN(val) || val < 100 || val > 4000) {
        return res.status(400).json({
          success: false,
          message: 'warningThreshold must be a number between 100 and 4000'
        });
      }
      updatePayload.warningThreshold = val;
    }

    if (criticalThreshold !== undefined) {
      const val = Number(criticalThreshold);
      if (isNaN(val) || val < 200 || val > 4095) {
        return res.status(400).json({
          success: false,
          message: 'criticalThreshold must be a number between 200 and 4095'
        });
      }
      updatePayload.criticalThreshold = val;
    }

    if (simulationInterval !== undefined) {
      const val = Number(simulationInterval);
      if (isNaN(val) || val < 500 || val > 60000) {
        return res.status(400).json({
          success: false,
          message: 'simulationInterval must be between 500ms and 60000ms'
        });
      }
      updatePayload.simulationInterval = val;
      simulator.setInterval(val);
    }

    if (simulationEnabled !== undefined) {
      updatePayload.simulationEnabled = Boolean(simulationEnabled);
      if (updatePayload.simulationEnabled) {
        simulator.start();
      } else {
        simulator.stop();
      }
    }

    const updated = await dataStore.updateSettings(deviceId, updatePayload);

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/settings/simulation/scenario
const triggerScenario = async (req, res, next) => {
  try {
    const { scenario } = req.body; // 'SAFE' | 'WARNING' | 'CRITICAL'

    if (!['SAFE', 'WARNING', 'CRITICAL'].includes(scenario)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scenario. Must be 'SAFE', 'WARNING', or 'CRITICAL'"
      });
    }

    simulator.triggerScenario(scenario);

    res.status(200).json({
      success: true,
      message: `Simulation scenario '${scenario}' triggered successfully`,
      status: simulator.getStatus()
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/settings/simulation/toggle
const toggleSimulation = async (req, res, next) => {
  try {
    const { enabled } = req.body;
    const deviceId = req.body.deviceId || 'SMOKE-001';

    const newState = enabled !== undefined ? Boolean(enabled) : !simulator.isRunning;
    
    if (newState) {
      simulator.start();
    } else {
      simulator.stop();
    }

    await dataStore.updateSettings(deviceId, { simulationEnabled: newState });

    res.status(200).json({
      success: true,
      message: `Simulator is now ${newState ? 'running' : 'stopped'}`,
      data: simulator.getStatus()
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  triggerScenario,
  toggleSimulation
};
