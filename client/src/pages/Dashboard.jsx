import React, { useState, useEffect, useCallback } from 'react';
import StatusCard from '../components/StatusCard';
import SmokeLevelCard from '../components/SmokeLevelCard';
import ActuatorCardsGrid from '../components/ActuatorCard';
import SmokeTrendChart from '../components/SmokeTrendChart';
import RecentAlerts from '../components/RecentAlerts';
import BottomSummaryCards from '../components/BottomSummaryCards';
import SimulationControls from '../components/SimulationControls';
import { 
  fetchLatestTelemetry, 
  fetchTelemetryHistory, 
  fetchAlerts, 
  fetchSettings, 
  acknowledgeAlert 
} from '../services/api';

const Dashboard = () => {
  const [latestData, setLatestData] = useState({
    rawAdc: 412,
    voltage: 0.33,
    status: 'SAFE',
    fanStatus: false,
    buzzerStatus: false,
    ledStatus: false,
    isSimulated: true
  });
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [thresholds, setThresholds] = useState({
    warningThreshold: 2000,
    criticalThreshold: 3000,
    simulationEnabled: true
  });
  const [timeRange, setTimeRange] = useState('1');
  const [loading, setLoading] = useState(true);

  // Load telemetry data from real backend REST APIs
  const loadDashboardData = useCallback(async () => {
    try {
      const [latestRes, historyRes, alertsRes, settingsRes] = await Promise.allSettled([
        fetchLatestTelemetry('SMOKE-001'),
        fetchTelemetryHistory({ deviceId: 'SMOKE-001', hours: timeRange, limit: 30 }),
        fetchAlerts({ limit: 5 }),
        fetchSettings('SMOKE-001')
      ]);

      if (latestRes.status === 'fulfilled' && latestRes.value) {
        setLatestData(latestRes.value);
      }

      if (historyRes.status === 'fulfilled' && Array.isArray(historyRes.value)) {
        setHistory(historyRes.value);
      }

      if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value)) {
        setAlerts(alertsRes.value);
      }

      if (settingsRes.status === 'fulfilled' && settingsRes.value) {
        setThresholds({
          warningThreshold: settingsRes.value.warningThreshold ?? 2000,
          criticalThreshold: settingsRes.value.criticalThreshold ?? 3000,
          simulationEnabled: settingsRes.value.simulatorStatus?.isRunning ?? true
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Periodic polling for real-time live dashboard sync
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 3000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Acknowledge alert handler
  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a._id === alertId ? { ...a, acknowledged: true } : a))
      );
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Simulation Controls Banner for Demoing */}
      <SimulationControls 
        isSimRunning={thresholds.simulationEnabled} 
        onActionSuccess={loadDashboardData} 
      />

      {/* Top 2 Status & Reading Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusCard status={latestData.status} />
        <SmokeLevelCard 
          rawAdc={latestData.rawAdc} 
          voltage={latestData.voltage} 
          status={latestData.status} 
        />
      </div>

      {/* Actuator Indicators */}
      <ActuatorCardsGrid 
        fan={latestData.fanStatus} 
        buzzer={latestData.buzzerStatus} 
        led={latestData.ledStatus} 
      />

      {/* Smoke Level Trend Line Chart & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SmokeTrendChart 
            data={history} 
            warningThreshold={thresholds.warningThreshold} 
            criticalThreshold={thresholds.criticalThreshold}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>
        <div className="lg:col-span-1">
          <RecentAlerts 
            alerts={alerts} 
            onAcknowledge={handleAcknowledge} 
          />
        </div>
      </div>

      {/* Bottom Summary Cards */}
      <BottomSummaryCards 
        currentReading={latestData.rawAdc} 
        warningThreshold={thresholds.warningThreshold} 
        criticalThreshold={thresholds.criticalThreshold} 
      />
    </div>
  );
};

export default Dashboard;
