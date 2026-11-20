import React from 'react';
import { Cpu, Layers, AlertTriangle } from 'lucide-react';

const BottomSummaryCards = ({
  currentReading = 412,
  warningThreshold = 2000,
  criticalThreshold = 3000
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Current Reading */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex items-center space-x-4">
        <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 p-3">
          <Cpu className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {currentReading?.toLocaleString() ?? '---'}
            </span>
            <span className="text-xs font-semibold text-slate-500">ADC</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
            Current Reading
          </p>
        </div>
      </div>

      {/* Warning Threshold */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex items-center space-x-4">
        <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 p-3">
          <Layers className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {warningThreshold?.toLocaleString() ?? '2,000'}
            </span>
            <span className="text-xs font-semibold text-slate-500">ADC</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
            Warning Threshold
          </p>
        </div>
      </div>

      {/* Critical Threshold */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex items-center space-x-4">
        <div className="w-13 h-13 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 p-3">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {criticalThreshold?.toLocaleString() ?? '3,000'}
            </span>
            <span className="text-xs font-semibold text-slate-500">ADC</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
            Critical Threshold
          </p>
        </div>
      </div>
    </div>
  );
};

export default BottomSummaryCards;
