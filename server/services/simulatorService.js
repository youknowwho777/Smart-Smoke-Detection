const telemetryService = require('./telemetryService');
const Settings = require('../models/Settings');

class SensorSimulator {
  constructor() {
    this.timer = null;
    this.deviceId = process.env.DEFAULT_DEVICE_ID || 'SMOKE-001';
    this.isRunning = false;
    this.intervalMs = 3000;
    
    // Internal simulation physics state
    this.currentValue = 420; // baseline safe value
    this.targetValue = 450;
    this.manualScenario = null; // null | 'SAFE' | 'WARNING' | 'CRITICAL'
    this.manualScenarioDuration = 0; // count of cycles remaining
    this.driftDirection = 1;
    this.cycleCount = 0;
  }

  async start() {
    if (this.isRunning) return;

    // Fetch initial settings from DB if available
    try {
      const settings = await Settings.findOne({ deviceId: this.deviceId });
      if (settings) {
        this.intervalMs = settings.simulationInterval || 3000;
        if (settings.simulationEnabled === false) {
          console.log('[Simulator] Simulation disabled in settings. Pausing.');
          this.isRunning = false;
          return;
        }
      }
    } catch (e) {
      console.warn('[Simulator] Could not fetch settings, using default interval 3000ms');
    }

    this.isRunning = true;
    console.log(`[Simulator] Started for device ${this.deviceId} with interval ${this.intervalMs}ms`);

    this.scheduleNextTick();
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[Simulator] Stopped.');
  }

  setInterval(ms) {
    if (ms >= 500 && ms <= 60000) {
      this.intervalMs = ms;
      if (this.isRunning) {
        if (this.timer) clearTimeout(this.timer);
        this.scheduleNextTick();
      }
    }
  }

  triggerScenario(scenarioType) {
    // scenarioType: 'SAFE' | 'WARNING' | 'CRITICAL'
    this.manualScenario = scenarioType;
    this.manualScenarioDuration = 10; // keep scenario for ~10 ticks then gradually recover
    console.log(`[Simulator] Manual scenario triggered: ${scenarioType}`);
    
    // Immediately execute a tick to reflect in UI without waiting
    this.tick();
  }

  scheduleNextTick() {
    if (!this.isRunning) return;
    this.timer = setTimeout(async () => {
      await this.tick();
      this.scheduleNextTick();
    }, this.intervalMs);
  }

  async tick() {
    try {
      this.cycleCount++;

      // Check current thresholds
      const settings = await telemetryService.getActiveSettings(this.deviceId);
      const warnThresh = settings.warningThreshold;
      const critThresh = settings.criticalThreshold;

      // Determine target value
      if (this.manualScenario) {
        if (this.manualScenario === 'CRITICAL') {
          this.targetValue = critThresh + 250 + Math.floor(Math.random() * 400);
        } else if (this.manualScenario === 'WARNING') {
          this.targetValue = warnThresh + 150 + Math.floor(Math.random() * 300);
        } else {
          this.targetValue = 380 + Math.floor(Math.random() * 120);
        }

        this.manualScenarioDuration--;
        if (this.manualScenarioDuration <= 0) {
          console.log(`[Simulator] Scenario ${this.manualScenario} finished, returning to ambient simulation.`);
          this.manualScenario = null;
        }
      } else {
        // Natural ambient simulation
        // Occasional spike every ~35 cycles (warning) or ~70 cycles (critical)
        if (this.cycleCount % 65 === 0) {
          this.targetValue = critThresh + 200;
        } else if (this.cycleCount % 25 === 0) {
          this.targetValue = warnThresh + 150;
        } else if (this.currentValue > warnThresh) {
          // If recovering from a spike, decay back toward safe baseline
          this.targetValue = 420;
        } else {
          // Normal ambient drift between 320 and 580 ADC
          const noise = (Math.random() - 0.48) * 40;
          this.targetValue = Math.max(300, Math.min(650, this.targetValue + noise));
        }
      }

      // Smooth realistic inertia / exponential moving average
      const stepFactor = this.manualScenario ? 0.45 : 0.25;
      this.currentValue = Math.round(this.currentValue + (this.targetValue - this.currentValue) * stepFactor);

      // Add slight jitter (±12 ADC)
      const jitter = Math.floor((Math.random() - 0.5) * 24);
      const rawAdc = Math.max(100, Math.min(4095, this.currentValue + jitter));
      const voltage = Number(((rawAdc / 4095) * 3.3).toFixed(2));

      // Build standard telemetry payload
      const payload = {
        deviceId: this.deviceId,
        timestamp: new Date().toISOString(),
        sensor: {
          type: 'MQ-2',
          rawAdc,
          voltage
        },
        isSimulated: true
      };

      await telemetryService.processTelemetry(payload);
    } catch (err) {
      console.error('[Simulator] Tick error:', err.message);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      deviceId: this.deviceId,
      intervalMs: this.intervalMs,
      currentValue: this.currentValue,
      activeScenario: this.manualScenario
    };
  }
}

const simulatorInstance = new SensorSimulator();

module.exports = simulatorInstance;
