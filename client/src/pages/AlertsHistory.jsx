import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCircle, 
  Filter, 
  Clock, 
  Search,
  CheckCheck
} from 'lucide-react';
import { fetchAlerts, acknowledgeAlert } from '../services/api';

const AlertsHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [ackFilter, setAckFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (severityFilter) params.severity = severityFilter;
      if (ackFilter !== '') params.acknowledged = ackFilter;

      const data = await fetchAlerts(params);
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [severityFilter, ackFilter]);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 5000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeAlert(id);
      setAlerts((prev) =>
        prev.map((a) => (a._id === id || a.id === id ? { ...a, acknowledged: true, acknowledgedAt: new Date() } : a))
      );
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleAcknowledgeAll = async () => {
    const unacked = alerts.filter((a) => !a.acknowledged);
    for (const a of unacked) {
      await acknowledgeAlert(a._id || a.id);
    }
    loadAlerts();
  };

  const filteredAlerts = alerts.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.message?.toLowerCase().includes(q) ||
      a.deviceId?.toLowerCase().includes(q) ||
      a.severity?.toLowerCase().includes(q)
    );
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>CRITICAL</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>WARNING</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
            <Info className="w-3.5 h-3.5" />
            <span>INFO</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts by message, device ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Severity & Status Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          <select
            value={ackFilter}
            onChange={(e) => setAckFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="false">Unacknowledged Only</option>
            <option value="true">Acknowledged Only</option>
          </select>

          {alerts.some((a) => !a.acknowledged) && (
            <button
              onClick={handleAcknowledgeAll}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5 transition shadow-sm"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Acknowledge All</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerts Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">
            Safety Event Log ({filteredAlerts.length})
          </h3>
          <span className="text-xs text-slate-500">
            Stored in MongoDB audit trail
          </span>
        </div>

        {loading && alerts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Loading alerts from database...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-base font-semibold text-slate-700">No matching alerts found</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filter criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAlerts.map((alert) => {
              const isCrit = alert.severity === 'CRITICAL';
              const isWarn = alert.severity === 'WARNING';
              const id = alert._id || alert.id;

              return (
                <div
                  key={id}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50/80 ${
                    !alert.acknowledged && isCrit ? 'bg-red-50/30' : !alert.acknowledged && isWarn ? 'bg-amber-50/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="mt-0.5">{getSeverityBadge(alert.severity)}</div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {alert.message}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          Device: {alert.deviceId}
                        </span>
                        <span>Value: <strong className="text-slate-800">{alert.sensorValue} ADC</strong></span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center shrink-0">
                    {alert.acknowledged ? (
                      <span className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Acknowledged</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm transition hover:border-slate-400"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsHistory;
