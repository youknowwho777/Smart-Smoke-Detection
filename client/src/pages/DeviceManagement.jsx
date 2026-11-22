import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  Plus, 
  Clock, 
  MapPin, 
  HardDrive, 
  Radio, 
  CheckCircle2,
  RefreshCw,
  Send
} from 'lucide-react';
import { fetchDevices, registerDevice, sendTelemetry } from '../services/api';

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDevice, setNewDevice] = useState({
    deviceId: '',
    deviceName: '',
    sensorType: 'MQ-2',
    mode: 'simulation',
    location: 'Lab A - Main Room',
    ipAddress: '192.168.1.120'
  });
  const [testPayloadMessage, setTestPayloadMessage] = useState('');

  const loadDevices = async () => {
    try {
      setLoading(true);
      const data = await fetchDevices();
      setDevices(data);
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!newDevice.deviceId) return;
    try {
      await registerDevice(newDevice);
      setShowModal(false);
      setNewDevice({
        deviceId: '',
        deviceName: '',
        sensorType: 'MQ-2',
        mode: 'simulation',
        location: 'Lab A - Main Room',
        ipAddress: '192.168.1.120'
      });
      loadDevices();
    } catch (err) {
      console.error('Failed to register device:', err);
    }
  };

  const handleSendTestPacket = async (deviceId) => {
    try {
      setTestPayloadMessage(`Sending test packet to ${deviceId}...`);
      await sendTelemetry({
        deviceId,
        timestamp: new Date().toISOString(),
        sensor: {
          type: 'MQ-2',
          rawAdc: 1950,
          voltage: 1.57
        },
        actuators: {
          buzzer: false,
          led: false
        }
      });
      setTestPayloadMessage(`✓ Successfully delivered telemetry packet to ${deviceId}`);
      setTimeout(() => setTestPayloadMessage(''), 4000);
      loadDevices();
    } catch (err) {
      setTestPayloadMessage(`Failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Add Device button */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Registered IoT Smoke Sensing Units ({devices.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage physical ESP32 nodes and simulated virtual detectors
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadDevices}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Device</span>
          </button>
        </div>
      </div>

      {testPayloadMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center space-x-2">
          <Send className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>{testPayloadMessage}</span>
        </div>
      )}

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && devices.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading device registry...</div>
        ) : devices.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Cpu className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-base font-semibold text-slate-700">No devices registered</p>
            <p className="text-xs text-slate-400 mt-1">Register a device or wait for the simulator to auto-provision SMOKE-001.</p>
          </div>
        ) : (
          devices.map((device) => {
            const isOnline = device.status !== 'offline';
            return (
              <div
                key={device.deviceId}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  {/* Top info and status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-tight">
                          {device.deviceName || device.deviceId}
                        </h3>
                        <p className="text-xs font-mono font-semibold text-blue-600 mt-0.5">
                          {device.deviceId}
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      device.status === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
                      device.status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        device.status === 'critical' ? 'bg-red-500 animate-ping' :
                        device.status === 'warning' ? 'bg-amber-500' :
                        isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}></span>
                      <span className="capitalize">{device.status || 'online'}</span>
                    </span>
                  </div>

                  {/* Device Specs */}
                  <div className="mt-5 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center space-x-1.5">
                        <Radio className="w-3.5 h-3.5" />
                        <span>Sensor Type:</span>
                      </span>
                      <span className="font-semibold text-slate-800">{device.sensorType || 'MQ-2'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center space-x-1.5">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>Operating Mode:</span>
                      </span>
                      <span className={`font-semibold capitalize px-2 py-0.5 rounded text-[11px] ${
                        device.mode === 'hardware' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {device.mode || 'simulation'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Location:</span>
                      </span>
                      <span className="font-semibold text-slate-800">{device.location || 'Lab A'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Last Telemetry:</span>
                      </span>
                      <span className="font-mono text-slate-600">
                        {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    IP: {device.ipAddress || '192.168.1.100'}
                  </span>
                  <button
                    onClick={() => handleSendTestPacket(device.deviceId)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    title="Send a sample telemetry packet to this device endpoint"
                  >
                    <Send className="w-3 h-3" />
                    <span>Ping Telemetry</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for Device Registration */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Register New IoT Device</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a new ESP32 microcontroller or simulated sensor node to the system.
            </p>

            <form onSubmit={handleRegister} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Device ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SMOKE-002"
                  value={newDevice.deviceId}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceId: e.target.value.toUpperCase() })}
                  className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Device Name</label>
                <input
                  type="text"
                  placeholder="e.g. Warehouse Zone B Detector"
                  value={newDevice.deviceName}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceName: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sensor Type</label>
                  <select
                    value={newDevice.sensorType}
                    onChange={(e) => setNewDevice({ ...newDevice, sensorType: e.target.value })}
                    className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MQ-2">MQ-2 (Smoke/LPG/CO)</option>
                    <option value="MQ-135">MQ-135 (Air Quality)</option>
                    <option value="MQ-7">MQ-7 (Carbon Monoxide)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mode</label>
                  <select
                    value={newDevice.mode}
                    onChange={(e) => setNewDevice({ ...newDevice, mode: e.target.value })}
                    className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="simulation">Simulation</option>
                    <option value="hardware">Hardware (ESP32)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Server Room Rack 4"
                  value={newDevice.location}
                  onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                >
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManagement;
