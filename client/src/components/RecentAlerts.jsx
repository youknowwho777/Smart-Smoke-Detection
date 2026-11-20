import React from 'react';
import { Bell, AlertTriangle, AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecentAlerts = ({ alerts = [], onAcknowledge }) => {
  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Recent Alerts
            </h3>
          </div>

          <Link
            to="/alerts"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 mt-2">
          {alerts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-600">No active alerts</p>
              <p className="text-xs text-slate-400 mt-0.5">The environment is clean and safe</p>
            </div>
          ) : (
            alerts.slice(0, 4).map((alert) => {
              const isCrit = alert.severity === 'CRITICAL';
              const isWarn = alert.severity === 'WARNING';
              const Icon = isCrit ? AlertOctagon : AlertTriangle;

              return (
                <div
                  key={alert._id || alert.id}
                  className={`p-3.5 rounded-xl border flex items-start justify-between transition-all ${
                    isCrit
                      ? 'bg-red-50/70 border-red-200 text-red-900'
                      : isWarn
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      isCrit ? 'bg-red-200/70 text-red-700' : isWarn ? 'bg-amber-200/70 text-amber-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-extrabold uppercase tracking-wider ${
                          isCrit ? 'text-red-600' : isWarn ? 'text-amber-600' : 'text-slate-600'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 mt-0.5 line-clamp-1">
                        {alert.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1 shrink-0 ml-3">
                    <span className="text-[11px] font-semibold text-slate-400">
                      {formatTime(alert.timestamp)}
                    </span>
                    {!alert.acknowledged && onAcknowledge && (
                      <button
                        onClick={() => onAcknowledge(alert._id || alert.id)}
                        className="text-[10px] font-bold text-slate-600 hover:text-blue-600 underline"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentAlerts;
