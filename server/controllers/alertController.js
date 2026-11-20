const dataStore = require('../utils/dataStore');

// GET /api/alerts
const getAlerts = async (req, res, next) => {
  try {
    const { deviceId, severity, acknowledged, limit = 50 } = req.query;

    const alerts = await dataStore.getAlerts({
      deviceId,
      severity,
      acknowledged,
      limit: parseInt(limit, 10) || 50
    });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/alerts/:id
const getAlertById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await dataStore.getAlertById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: `Alert with ID ${id} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/alerts/:id/acknowledge
const acknowledgeAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await dataStore.acknowledgeAlert(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: `Alert with ID ${id} not found`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: alert
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAlerts,
  getAlertById,
  acknowledgeAlert
};
