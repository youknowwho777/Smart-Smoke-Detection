import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Gauge, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Terminal,
  RefreshCw,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { fetchLatestTelemetry, fetchTelemetryHistory, fetchSettings } from '../services/api';

const LiveMonitoring = () => {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState({ warningThreshold: 2000, criticalThreshold: 3000 });
  const [refreshInterval, setRefreshInterval] = useState(2000);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      const [tel, hist, setts] = await Promise.allSettled([
        fetchLatestTelemetry('SMOKE-001'),
        fetchTelemetryHistory({ deviceId: 'SMOKE-001', limit: 40 }),
        fetchSettings('SMOKE-001')
      ]);

      if (tel.status === 'fulfilled' && tel.value) {
        setLatest(tel.value);
        setLastUpdated(new Date());
      }
      if (hist.status === 'fulfilled' && Array.isArray(hist.value)) {
        setHistory(hist.value);
      }
      if (setts.status === 'fulfilled' && setts.value) {
        setSettings(setts.value);
      }
    } catch (err) {
      console.error('Monitoring fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const rawAdc = latest?.rawAdc ?? 0;
  const voltage = latest?.voltage ?? 0;
  const status = latest?.status ?? 'SAFE';
  const percentage = Math.min(100, Math.round((rawAdc / 4095) * 100));

  const chartData = history.map((pt) => ({
    time: new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rawAdc: pt.rawAdc,
    voltage: pt.voltage,
    status: pt.status
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Controls & Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Live Real-Time Telemetry Stream
            </h2>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Last packet: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-600">Polling Rate:</label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
          >
            <option value={1000}>1 Second (High Speed)</option>
            <option value={2000}>2 Seconds (Normal)</option>
            <option value={5000}>5 Seconds (Low Bandwidth)</option>
          </select>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Refresh manually"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Gauges & Meters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ADC Meter */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ADC Quantization (12-bit)
            </span>
            <Gauge className="w-5 h-5 text-blue-600" />
          </div>
          <div className="my-6">
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-black text-slate-900 tracking-tight">
                {rawAdc}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 4095 ADC</span>
            </div>
            {/* Range bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 mt-4 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  status === 'CRITICAL' ? 'bg-red-500' : status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>0 (Clean Air)</span>
            <span>2000 (Warn)</span>
            <span>4095 (Max)</span>
          </div>
        </div>

        {/* Voltage Sensor Reading */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Analog Sensor Voltage
            </span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="my-6">
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-black text-slate-900 tracking-tight">
                {voltage}
              </span>
              <span className="text-sm font-semibold text-slate-400">Volts (V)</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Mapped linearly across ESP32 3.3V reference voltage scale.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Formula: (ADC / 4095) * 3.3V
          </div>
        </div>

        {/* Current Safety State Card */}
        <div className={`rounded-2xl border p-6 shadow-sm flex flex-col justify-between transition-all ${
          status === 'CRITICAL'
            ? 'bg-red-50 border-red-300 text-red-900'
            : status === 'WARNING'
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">
              Safety Assessment
            </span>
            {status === 'CRITICAL' ? (
              <Flame className="w-6 h-6 text-red-600 animate-bounce" />
            ) : status === 'WARNING' ? (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            )}
          </div>
          <div className="my-4">
            <h3 className="text-3xl font-black tracking-tight">{status}</h3>
            <p className="text-xs font-medium mt-1 opacity-80">
              {status === 'CRITICAL'
                ? 'Hazardous smoke concentration detected! Audio-visual alarms active.'
                : status === 'WARNING'
                ? 'Elevated smoke detected above advisory threshold. Warning lights active.'
                : 'Sensor levels indicate normal, clean atmospheric conditions.'}
            </p>
          </div>
          <div className="text-xs font-bold">
            Hardware Actuators Active: {latest?.buzzerStatus ? 'Buzzer Alarm ' : ''} {latest?.ledStatus ? '• Alert Lights' : ''} {!latest?.buzzerStatus && !latest?.ledStatus ? 'None (Nominal Standby)' : ''}
          </div>
        </div>
      </div>

      {/* Real-time High Resolution Graph */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4">
          Continuous Real-Time Telemetry Stream
        </h3>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 4200]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs space-y-1">
                        <p className="text-slate-400">{d.time}</p>
                        <p className="font-bold text-blue-400">{d.rawAdc} ADC ({d.voltage}V)</p>
                        <p className="text-slate-300">Status: {d.status}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={settings.warningThreshold} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Warning', fill: '#f59e0b', fontSize: 11 }} />
              <ReferenceLine y={settings.criticalThreshold} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critical', fill: '#ef4444', fontSize: 11 }} />
              <Line type="monotone" dataKey="rawAdc" stroke="#2563eb" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Raw Payload Inspector (Useful for verifying ESP32 integration) */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-2 mb-3">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Raw ESP32 Ingestion Telemetry Packet (JSON)
          </h4>
        </div>
        <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800/80">
          {JSON.stringify(latest, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default LiveMonitoring;
