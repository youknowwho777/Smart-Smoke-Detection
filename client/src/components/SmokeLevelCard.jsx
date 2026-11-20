import React from 'react';
import { Wind, ArrowDown, ArrowUp, AlertTriangle } from 'lucide-react';

const SmokeLevelCard = ({ rawAdc = 412, voltage = 0.33, status = 'SAFE' }) => {
  const normStatus = (status || 'SAFE').toUpperCase();

  const getPill = () => {
    if (normStatus === 'CRITICAL') {
      return (
        <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Critical Hazard</span>
        </span>
      );
    }
    if (normStatus === 'WARNING') {
      return (
        <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Threshold Exceeded</span>
        </span>
      );
    }
    return (
      <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <ArrowDown className="w-3.5 h-3.5" />
        <span>Within safe range</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex items-center justify-between transition-all">
      <div className="flex items-center space-x-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-sm">
          <Wind className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Smoke Level
          </span>
          <div className="flex items-baseline space-x-2 mt-0.5">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {rawAdc}
            </span>
            <span className="text-sm font-semibold text-slate-500">ADC</span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Voltage: <span className="text-slate-600 font-semibold">{voltage} V</span>
          </p>
        </div>
      </div>

      <div>
        {getPill()}
      </div>
    </div>
  );
};

export default SmokeLevelCard;
