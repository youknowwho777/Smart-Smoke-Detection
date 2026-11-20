import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Telemetry APIs
export const fetchLatestTelemetry = async (deviceId = 'SMOKE-001') => {
  const response = await api.get('/telemetry/latest', { params: { deviceId } });
  return response.data.data;
};

export const fetchTelemetryHistory = async (params = {}) => {
  const response = await api.get('/telemetry/history', { params });
  return response.data.data || [];
};

export const sendTelemetry = async (payload) => {
  const response = await api.post('/telemetry', payload);
  return response.data.data;
};

// Device APIs
export const fetchDevices = async () => {
  const response = await api.get('/devices');
  return response.data.data || [];
};

export const fetchDeviceById = async (deviceId) => {
  const response = await api.get(`/devices/${deviceId}`);
  return response.data.data;
};

export const registerDevice = async (deviceData) => {
  const response = await api.post('/devices/register', deviceData);
  return response.data.data;
};

// Alert APIs
export const fetchAlerts = async (params = {}) => {
  const response = await api.get('/alerts', { params });
  return response.data.data || [];
};

export const acknowledgeAlert = async (alertId) => {
  const response = await api.patch(`/alerts/${alertId}/acknowledge`);
  return response.data.data;
};

// Settings APIs
export const fetchSettings = async (deviceId = 'SMOKE-001') => {
  const response = await api.get('/settings', { params: { deviceId } });
  return response.data.data;
};

export const updateSettings = async (settingsData) => {
  const response = await api.put('/settings', settingsData);
  return response.data.data;
};

export const triggerScenario = async (scenario) => {
  const response = await api.post('/settings/simulation/scenario', { scenario });
  return response.data;
};

export const toggleSimulation = async (enabled) => {
  const response = await api.post('/settings/simulation/toggle', { enabled });
  return response.data;
};

// System API
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
