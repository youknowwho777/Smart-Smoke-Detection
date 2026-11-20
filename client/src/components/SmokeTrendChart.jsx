import React from 'react';
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
import { TrendingUp } from 'lucide-react';

const SmokeTrendChart = ({ 
  data = [], 
  warningThreshold = 2000, 
  criticalThreshold = 3000,
  timeRange = '1',
  onTimeRangeChange
}) => {
  // Format data for chart display
  const chartData = data.map((item) => {
    const d = new Date(item.timestamp);
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return {
      time: timeStr,
      rawAdc: item.rawAdc,
      voltage: item.voltage,
      status: item.status,
      warnRef: warningThreshold,
      critRef: criticalThreshold
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
      {/* Header and Filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Smoke Level Trend
          </h3>
        </div>

        {onTimeRangeChange && (
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="0.5">Last 30 Mins</option>
            <option value="1">Last 1 Hour</option>
            <option value="6">Last 6 Hours</option>
            <option value="24">Last 24 Hours</option>
          </select>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 mt-2">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <p className="text-sm">No telemetry records collected yet</p>
            <p className="text-xs text-slate-400 mt-1">Simulating readings...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              
              <YAxis 
                domain={[0, 4200]} 
                ticks={[0, 1000, 2000, 3000, 4000]}
                tick={{ fontSize: 11, fill: '#64748b' }} 
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />

              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const dataPt = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
                        <p className="font-semibold text-slate-300">{label}</p>
                        <p className="font-bold text-blue-400">Smoke: {dataPt.rawAdc} ADC</p>
                        <p className="text-slate-400">Voltage: {dataPt.voltage} V</p>
                        <p className={`font-semibold ${
                          dataPt.status === 'CRITICAL' ? 'text-red-400' :
                          dataPt.status === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          Status: {dataPt.status}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Dynamic Warning and Critical threshold dashed reference lines */}
              <ReferenceLine 
                y={warningThreshold} 
                stroke="#f59e0b" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
              />
              
              <ReferenceLine 
                y={criticalThreshold} 
                stroke="#ef4444" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
              />

              {/* Actual Smoke Level Line */}
              <Line
                type="monotone"
                dataKey="rawAdc"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#2563eb', strokeWidth: 1 }}
                activeDot={{ r: 5, fill: '#1d4ed8' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Custom Legend Matching Reference Image */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-blue-600"></span>
          <span>Smoke Level (ADC)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-500"></span>
          <span>Warning Threshold ({warningThreshold})</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-red-500"></span>
          <span>Critical Threshold ({criticalThreshold})</span>
        </div>
      </div>
    </div>
  );
};

export default SmokeTrendChart;
