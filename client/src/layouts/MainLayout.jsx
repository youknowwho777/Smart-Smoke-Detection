import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { fetchLatestTelemetry, fetchAlerts, checkHealth } from '../services/api';

const MainLayout = () => {
  const location = useLocation();
  const [deviceInfo, setDeviceInfo] = useState({
    deviceId: 'SMOKE-001',
    status: 'online',
    mode: 'simulation'
  });
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [backendConnected, setBackendConnected] = useState(true);

  // Derive dynamic page titles based on current route
  const getPageMeta = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Dashboard',
          subtitle: 'Real-time smoke monitoring and automated safety system'
        };
      case '/monitoring':
        return {
          title: 'Live Monitoring',
          subtitle: 'Continuous ADC sensor readings, voltage levels, and telemetry stream'
        };
      case '/alerts':
        return {
          title: 'Alerts & History',
          subtitle: 'Comprehensive audit trail of safety events, warnings, and acknowledgments'
        };
      case '/devices':
        return {
          title: 'Device Management',
          subtitle: 'Connected IoT hardware, operating modes, and communication telemetry'
        };
      case '/settings':
        return {
          title: 'System Settings',
          subtitle: 'Safety thresholds, sensor polling frequency, and simulator controls'
        };
      default:
        return {
          title: 'Smart Smoke Detection',
          subtitle: 'IoT Safety System'
        };
    }
  };

  const { title, subtitle } = getPageMeta();

  // Periodic polling for global header stats
  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const [healthRes, latestTel, alerts] = await Promise.allSettled([
          checkHealth(),
          fetchLatestTelemetry('SMOKE-001'),
          fetchAlerts({ acknowledged: false, limit: 10 })
        ]);

        if (!isMounted) return;

        if (healthRes.status === 'fulfilled') {
          setBackendConnected(true);
        } else {
          setBackendConnected(false);
        }

        if (latestTel.status === 'fulfilled' && latestTel.value) {
          const reading = latestTel.value;
          setDeviceInfo({
            deviceId: reading.deviceId || 'SMOKE-001',
            status: reading.status?.toLowerCase() || 'online',
            mode: reading.isSimulated ? 'simulation' : 'hardware'
          });
        }

        if (alerts.status === 'fulfilled' && Array.isArray(alerts.value)) {
          setUnreadAlerts(alerts.value.length);
        }
      } catch (err) {
        if (isMounted) setBackendConnected(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f3f6fa]">
      <Sidebar deviceStatus={deviceInfo.status} deviceId={deviceInfo.deviceId} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header 
          title={title} 
          subtitle={subtitle} 
          isSimulation={deviceInfo.mode === 'simulation'}
          unreadAlertsCount={unreadAlerts}
          backendConnected={backendConnected}
        />

        <main className="flex-1 px-8 pb-10">
          <Outlet context={{ deviceInfo, backendConnected }} />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
