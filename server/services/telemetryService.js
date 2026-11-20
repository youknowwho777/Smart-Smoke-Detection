const dataStore = require('../utils/dataStore');

// In-memory state tracking to prevent duplicate alert spamming
const deviceStateCache = new Map();

/**
 * Get active thresholds for a device
 */
const getActiveSettings = async (deviceId) => {
  try {
    const settings = await dataStore.getSettings(deviceId);
    if (settings) {
      return {
        warningThreshold: Number(settings.warningThreshold) || 2000,
        criticalThreshold: Number(settings.criticalThreshold) || 3000,
        simulationInterval: Number(settings.simulationInterval) || 3000,
        simulationEnabled: settings.simulationEnabled !== undefined ? settings.simulationEnabled : true
      };
    }
  } catch (err) {
    console.error('[TelemetryService] Error loading settings:', err.message);
  }
  return {
    warningThreshold: 2000,
    criticalThreshold: 3000,
    simulationInterval: 3000,
    simulationEnabled: true
  };
};

/**
 * Process incoming telemetry reading (from ESP32 hardware or Simulator)
 */
const processTelemetry = async (payload) => {
  const deviceId = payload.deviceId || process.env.DEFAULT_DEVICE_ID || 'SMOKE-001';
  
  // Parse rawAdc and voltage from nested or flat payload
  let rawAdc = 0;
  let voltage = 0;
  let isSimulated = payload.isSimulated !== undefined ? payload.isSimulated : false;

  if (payload.sensor) {
    rawAdc = Number(payload.sensor.rawAdc) || 0;
    voltage = Number(payload.sensor.voltage) || Number(((rawAdc / 4095) * 3.3).toFixed(2));
  } else {
    rawAdc = Number(payload.rawAdc) || 0;
    voltage = Number(payload.voltage) || Number(((rawAdc / 4095) * 3.3).toFixed(2));
  }

  // Load active thresholds
  const { warningThreshold, criticalThreshold } = await getActiveSettings(deviceId);

  // Evaluate safety status
  let status = 'SAFE';
  let fanStatus = false;
  let buzzerStatus = false;
  let ledStatus = false;

  if (rawAdc >= criticalThreshold) {
    status = 'CRITICAL';
    fanStatus = true;
    buzzerStatus = true;
    ledStatus = true;
  } else if (rawAdc >= warningThreshold) {
    status = 'WARNING';
    fanStatus = true;
    buzzerStatus = false;
    ledStatus = true;
  } else {
    status = 'SAFE';
    fanStatus = false;
    buzzerStatus = false;
    ledStatus = false;
  }

  // If incoming payload has explicit actuator states (e.g. from actual hardware), merge them
  if (payload.actuators) {
    if (payload.actuators.fan !== undefined) fanStatus = Boolean(payload.actuators.fan);
    if (payload.actuators.buzzer !== undefined) buzzerStatus = Boolean(payload.actuators.buzzer);
    if (payload.actuators.led !== undefined) ledStatus = Boolean(payload.actuators.led);
  }

  const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();

  // Save sensor reading record
  const reading = await dataStore.saveReading({
    deviceId,
    rawAdc,
    voltage,
    status,
    fanStatus,
    buzzerStatus,
    ledStatus,
    isSimulated,
    timestamp
  });

  // Alert state transition logic (avoid duplicate alert flood while remaining in same state)
  const previousState = deviceStateCache.get(deviceId) || { status: 'SAFE' };

  if (previousState.status !== status) {
    if (status === 'CRITICAL') {
      await dataStore.saveAlert({
        deviceId,
        severity: 'CRITICAL',
        message: `High smoke level detected (${rawAdc} ADC / ${voltage}V). Exhaust fan & buzzer active!`,
        sensorValue: rawAdc,
        timestamp
      });
      console.log(`[Alert] CRITICAL alert triggered for ${deviceId}: ${rawAdc} ADC`);
    } else if (status === 'WARNING') {
      await dataStore.saveAlert({
        deviceId,
        severity: 'WARNING',
        message: `Smoke level above ${warningThreshold} ADC threshold (${rawAdc} ADC). Ventilation fan triggered.`,
        sensorValue: rawAdc,
        timestamp
      });
      console.log(`[Alert] WARNING alert triggered for ${deviceId}: ${rawAdc} ADC`);
    } else if (previousState.status !== 'SAFE' && status === 'SAFE') {
      await dataStore.saveAlert({
        deviceId,
        severity: 'INFO',
        message: `Smoke level returned to safe range (${rawAdc} ADC). All systems nominal.`,
        sensorValue: rawAdc,
        timestamp
      });
      console.log(`[Alert] System normalized to SAFE for ${deviceId}`);
    }

    deviceStateCache.set(deviceId, { status, lastTransition: timestamp });
  }

  // Update or register Device status
  const deviceStatus = status === 'CRITICAL' ? 'critical' : status === 'WARNING' ? 'warning' : 'online';
  await dataStore.upsertDevice(deviceId, {
    status: deviceStatus,
    mode: isSimulated ? 'simulation' : 'hardware',
    lastSeen: timestamp
  });

  return reading;
};

module.exports = {
  processTelemetry,
  getActiveSettings
};
