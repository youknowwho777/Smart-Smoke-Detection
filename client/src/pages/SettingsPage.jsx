import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Save, 
  Check, 
  AlertCircle, 
  Cpu, 
  Database, 
  RefreshCw,
  Clock,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { fetchSettings, updateSettings, checkHealth } from '../services/api';

const SettingsPage = () => {
  const [formData, setFormData] = useState({
    deviceId: 'SMOKE-001',
    warningThreshold: 2000,
    criticalThreshold: 3000,
    simulationInterval: 3000,
    simulationEnabled: true
  });
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [settings, health] = await Promise.all([
        fetchSettings('SMOKE-001'),
        checkHealth()
      ]);

      if (settings) {
        setFormData({
          deviceId: settings.deviceId || 'SMOKE-001',
          warningThreshold: settings.warningThreshold ?? 2000,
          criticalThreshold: settings.criticalThreshold ?? 3000,
          simulationInterval: settings.simulationInterval ?? 3000,
          simulationEnabled: settings.simulationEnabled ?? true
        });
      }

      if (health) {
        setHealthData(health);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value) || value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFeedback({ type: '', message: '' });

      // Threshold sanity check
      if (Number(formData.warningThreshold) >= Number(formData.criticalThreshold)) {
        setFeedback({
          type: 'error',
          message: 'Warning threshold must be strictly less than Critical threshold.'
        });
        setSaving(false);
        return;
      }

      await updateSettings(formData);
      setFeedback({
        type: 'success',
        message: '✓ Safety thresholds and simulator parameters updated successfully in MongoDB!'
      });
      loadData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to save settings.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              System & Safety Calibration Settings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tune ADC trigger thresholds, simulation tick frequency, and persistent storage
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          title="Reload active settings"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {feedback.message && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Safety Trigger Thresholds
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            The system compares incoming 12-bit ADC values (0–4095) against these levels to activate fans and alarms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Warning Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Warning Threshold (ADC)</span>
              </label>
              <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                {formData.warningThreshold} ADC
              </span>
            </div>
            <input
              type="number"
              name="warningThreshold"
              min="200"
              max="4000"
              step="50"
              value={formData.warningThreshold}
              onChange={handleChange}
              className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-[11px] text-slate-400">
              Triggers ventilation fan and issues WARNING alert. Default: 2000 ADC.
            </p>
          </div>

          {/* Critical Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span>Critical Threshold (ADC)</span>
              </label>
              <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                {formData.criticalThreshold} ADC
              </span>
            </div>
            <input
              type="number"
              name="criticalThreshold"
              min="500"
              max="4095"
              step="50"
              value={formData.criticalThreshold}
              onChange={handleChange}
              className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-[11px] text-slate-400">
              Engages exhaust fan, buzzer, and alert LED. Default: 3000 ADC.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Simulator Engine Parameters
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Controls how fast simulated smoke drift is computed and dispatched into MongoDB.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Interval */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Simulation Tick Interval (ms)</span>
              </label>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {formData.simulationInterval} ms
              </span>
            </div>
            <input
              type="number"
              name="simulationInterval"
              min="500"
              max="60000"
              step="500"
              value={formData.simulationInterval}
              onChange={handleChange}
              className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-[11px] text-slate-400">
              Allowed range: 500ms to 60,000ms. Recommended: 3000ms.
            </p>
          </div>

          {/* Toggle simulator */}
          <div className="flex items-center space-x-3 pt-6">
            <input
              type="checkbox"
              id="simulationEnabled"
              name="simulationEnabled"
              checked={formData.simulationEnabled}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="simulationEnabled" className="text-xs font-bold text-slate-700 cursor-pointer">
              Enable Automatic Backend Sensor Simulator
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="border-t border-slate-100 pt-5 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 transition shadow-md shadow-blue-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Apply & Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Backend Infrastructure Diagnostics */}
      {healthData && (
        <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Backend System & Database Diagnostics
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono pt-2">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Database Status</span>
              <span className="text-emerald-400 font-bold">{healthData.database?.isConnected ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Database Engine</span>
              <span className="text-blue-400 font-bold">{healthData.database?.isMockFallback ? 'In-Memory Fallback' : 'MongoDB Server'}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Node.js Runtime</span>
              <span className="text-slate-300 font-bold">{healthData.system?.nodeVersion}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Process Uptime</span>
              <span className="text-amber-400 font-bold">{Math.round(healthData.uptime)} seconds</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
